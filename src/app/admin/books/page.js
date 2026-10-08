"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, COLLEGE_LIBRARY_BOOKS, getBookCover, fetchBookByIsbn, getOpenLibraryCoverUrl } from "@/lib/utils";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Hash,
  Tag,
  Check,
  Sparkles,
  Loader2,
  Image as ImageIcon
} from "lucide-react";

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: CATEGORIES[0],
    total_copies: 5,
    cover_url: "",
  });
  const [coverFile, setCoverFile] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [fetchingIsbn, setFetchingIsbn] = useState(false);
  const [formError, setFormError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const catalog = data && data.length > 0 ? data : COLLEGE_LIBRARY_BOOKS;
      setBooks(catalog);
      setFilteredBooks(catalog);
    } catch (err) {
      console.error("Error loading books:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();

    // Supabase Realtime subscription
    const supabase = createClient();
    const channel = supabase
      .channel("admin_books_live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "books" },
        () => {
          loadBooks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadBooks]);

  const handleFetchFromOpenLibrary = async () => {
    if (!formData.isbn.trim()) {
      setFormError("Please enter an ISBN number first to auto-fetch details.");
      return;
    }

    setFetchingIsbn(true);
    setFormError(null);

    try {
      const bookData = await fetchBookByIsbn(formData.isbn.trim());
      setFormData((prev) => ({
        ...prev,
        title: bookData.title || prev.title,
        author: bookData.author || prev.author,
        category: bookData.category || prev.category,
        cover_url: bookData.cover_url || getOpenLibraryCoverUrl(formData.isbn.trim(), "L"),
      }));
      showToast("Book details and cover artwork fetched from Open Library!");
    } catch (err) {
      console.warn("Open library fetch issue:", err);
      // Even if metadata API fails, still assign Open Library Cover URL from ISBN
      const fallbackCover = getOpenLibraryCoverUrl(formData.isbn.trim(), "L");
      setFormData((prev) => ({ ...prev, cover_url: fallbackCover }));
      setFormError("Could not fetch full details, but Open Library cover URL has been linked!");
    } finally {
      setFetchingIsbn(false);
    }
  };


  // Filter effect
  useEffect(() => {
    let list = [...books];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      list = list.filter((b) => b.category === selectedCategory);
    }

    setFilteredBooks(list);
  }, [searchQuery, selectedCategory, books]);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      category: CATEGORIES[0],
      total_copies: 5,
      cover_url: "",
    });
    setCoverFile(null);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      total_copies: book.total_copies,
      available_copies: book.available_copies,
      cover_url: book.cover_url || "",
    });
    setCoverFile(null);
    setFormError(null);
    setEditingBook(book);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    try {
      const supabase = createClient();
      let coverUrl = formData.cover_url;

      // Handle Cover image file upload to Supabase Storage if provided
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop();
        const fileName = `cover-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("book-covers")
          .upload(fileName, coverFile);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("book-covers")
            .getPublicUrl(fileName);
          coverUrl = publicUrlData.publicUrl;
        } else {
          console.warn("Cover image upload failed, keeping existing URL:", uploadError);
        }
      }

      if (editingBook) {
        // Calculate available_copies adjusted for change in total_copies
        const copiesDiff = Number(formData.total_copies) - Number(editingBook.total_copies);
        const newAvailable = Math.max(0, Number(editingBook.available_copies) + copiesDiff);

        const { error: updateError } = await supabase
          .from("books")
          .update({
            title: formData.title.trim(),
            author: formData.author.trim(),
            isbn: formData.isbn.trim(),
            category: formData.category,
            total_copies: Number(formData.total_copies),
            available_copies: newAvailable,
            cover_url: coverUrl,
          })
          .eq("id", editingBook.id);

        if (updateError) {
          if (updateError.message?.includes("unique") || updateError.message?.includes("isbn")) {
            throw new Error("A book with this ISBN already exists.");
          }
          throw updateError;
        }

        showToast("Book updated successfully!");
        setEditingBook(null);
      } else {
        // Insert new book
        const { error: insertError } = await supabase.from("books").insert({
          title: formData.title.trim(),
          author: formData.author.trim(),
          isbn: formData.isbn.trim(),
          category: formData.category,
          total_copies: Number(formData.total_copies),
          available_copies: Number(formData.total_copies),
          cover_url: coverUrl || null,
        });

        if (insertError) {
          if (insertError.message?.includes("unique") || insertError.message?.includes("isbn")) {
            throw new Error("A book with this ISBN already exists in the catalog.");
          }
          throw insertError;
        }

        showToast("New book successfully added to catalog!");
        setIsAddModalOpen(false);
      }

      await loadBooks();
    } catch (err) {
      console.error("Save book error:", err);
      setFormError(err.message || "Failed to save book.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!deletingBook) return;
    setFormSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("books")
        .delete()
        .eq("id", deletingBook.id);

      if (error) throw error;

      showToast(`"${deletingBook.title}" deleted from catalog.`);
      setDeletingBook(null);
      await loadBooks();
    } catch (err) {
      console.error("Delete book error:", err);
      alert(err.message || "Failed to delete book. It may have active loan records.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Book Inventory Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain the central library book repository, stock copies, and cover artwork.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Book
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="block w-full pl-10 pr-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm animate-pulse bg-white rounded-2xl border border-slate-200">
          Loading book inventory...
        </div>
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Books Found"
          description={
            searchQuery || selectedCategory !== "All"
              ? "No books match your search filters."
              : "Your catalog is empty. Click below to add your first library book."
          }
          actionLabel={books.length === 0 ? "Add Book Now" : "Clear Filter"}
          onAction={() => {
            if (books.length === 0) handleOpenAdd();
            else {
              setSearchQuery("");
              setSelectedCategory("All");
            }
          }}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Book & Author</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">ISBN</th>
                <th className="px-5 py-3.5">Total Copies</th>
                <th className="px-5 py-3.5">Available</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 rounded-lg bg-slate-900 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                        {getBookCover(book, "S") ? (
                          <img src={getBookCover(book, "S")} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{book.title}</p>
                        <p className="text-xs text-slate-500">by {book.author}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {book.category}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-slate-600">
                    {book.isbn}
                  </td>

                  <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                    {book.total_copies}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        book.available_copies > 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {book.available_copies} available
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(book)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition"
                        title="Edit Book"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingBook(book)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingBook}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBook(null);
        }}
        title={editingBook ? "Edit Book Record" : "Add New Book to Library"}
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveBook} className="space-y-4">
          {/* ISBN with Auto-Fetch Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ISBN Number *
              </label>
              <button
                type="button"
                onClick={handleFetchFromOpenLibrary}
                disabled={fetchingIsbn || !formData.isbn.trim()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200 transition disabled:opacity-50"
              >
                {fetchingIsbn ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Fetching Open Library...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    Auto-Fill via ISBN (Open Library)
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="e.g. 978-0132350884 or 9780262046305"
              className="block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Book Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Clean Code: A Handbook of Agile Software Craftsmanship"
              className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Author(s) *
            </label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="e.g. Robert C. Martin"
              className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Category / Subject *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Total Copies in Stock *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.total_copies}
                onChange={(e) => setFormData({ ...formData, total_copies: e.target.value })}
                className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Cover Image Artwork */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Cover Image Artwork
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Cover Preview */}
              <div className="w-14 h-20 rounded-lg bg-slate-900 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                {formData.cover_url || (formData.isbn && getOpenLibraryCoverUrl(formData.isbn, "S")) ? (
                  <img
                    src={formData.cover_url || getOpenLibraryCoverUrl(formData.isbn, "S")}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <input
                  type="url"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  placeholder="https://covers.openlibrary.org/b/isbn/..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-brand-600" />
                    {coverFile ? coverFile.name : "Upload Custom File"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">or use auto Open Library cover URL</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingBook(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition disabled:opacity-60"
            >
              {formSubmitting ? "Saving..." : editingBook ? "Update Book" : "Add Book"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingBook}
        onClose={() => setDeletingBook(null)}
        title="Confirm Book Deletion"
        maxWidth="max-w-md"
      >
        {deletingBook && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-slate-900">{deletingBook.title}</strong> (ISBN: {deletingBook.isbn}) from the library catalog?
            </p>
            <p className="text-xs text-rose-600 font-medium">
              Warning: This action cannot be undone. Active loan records for this book must be returned first.
            </p>
            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setDeletingBook(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBook}
                disabled={formSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm"
              >
                {formSubmitting ? "Deleting..." : "Delete Book"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
