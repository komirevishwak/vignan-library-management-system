import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const FINE_RATE_PER_DAY = 5; // ₹5 per day

/**
 * Calculates overdue fine amount
 * @param {string|Date} dueDate
 * @param {string|Date} [returnDate]
 * @returns {{ daysOverdue: number, fine: number, isOverdue: boolean }}
 */
export function calculateFine(dueDate, returnDate = null) {
  if (!dueDate) return { daysOverdue: 0, fine: 0, isOverdue: false };

  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);
  
  const end = returnDate ? new Date(returnDate) : new Date();

  if (end > due) {
    const diffTime = end.getTime() - due.getTime();
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      daysOverdue: Math.max(0, daysOverdue),
      fine: Math.max(0, daysOverdue * FINE_RATE_PER_DAY),
      isOverdue: true,
    };
  }

  return { daysOverdue: 0, fine: 0, isOverdue: false };
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    url &&
    key &&
    !url.includes("placeholder") &&
    !url.includes("your-project") &&
    !key.includes("your-anon-key")
  );
}

export const CATEGORIES = [
  "Programming",
  "Data Structures",
  "Databases",
  "Web Development",
  "AI & ML",
  "Cloud",
  "Cybersecurity",
  "Computer Networks",
  "Operating Systems",
  "Software Engineering",
  "IoT",
  "Data Science",
  "Computer Architecture",
  "Mobile Development",
  "Emerging Tech",
];

const LEGACY_COLLEGE_LIBRARY_BOOKS = [
  {
    id: "book-cs-1",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen, Charles E. Leiserson",
    isbn: "978-0262046305",
    category: "Computer Science",
    total_copies: 8,
    available_copies: 6,
    cover_url: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-cs-2",
    title: "Clean Code: Agile Software Craftsmanship",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Computer Science",
    total_copies: 6,
    available_copies: 4,
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-cs-3",
    title: "Database System Concepts",
    author: "Abraham Silberschatz, Henry Korth",
    isbn: "978-0078022159",
    category: "Computer Science",
    total_copies: 7,
    available_copies: 5,
    cover_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-it-1",
    title: "Computer Networking: A Top-Down Approach",
    author: "James Kurose, Keith Ross",
    isbn: "978-0133594140",
    category: "Information Technology",
    total_copies: 5,
    available_copies: 3,
    cover_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-it-2",
    title: "Operating System Concepts",
    author: "Abraham Silberschatz, Peter Galvin",
    isbn: "978-1118063330",
    category: "Information Technology",
    total_copies: 6,
    available_copies: 4,
    cover_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-ai-1",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    isbn: "978-0134610993",
    category: "AI & Data Science",
    total_copies: 6,
    available_copies: 5,
    cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-ai-2",
    title: "Deep Learning",
    author: "Ian Goodfellow, Yoshua Bengio",
    isbn: "978-0262035613",
    category: "AI & Data Science",
    total_copies: 4,
    available_copies: 2,
    cover_url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-ai-3",
    title: "Hands-On Machine Learning",
    author: "Aurélien Géron",
    isbn: "978-1098125974",
    category: "AI & Data Science",
    total_copies: 5,
    available_copies: 3,
    cover_url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-elec-1",
    title: "Microelectronic Circuits",
    author: "Adel S. Sedra, Kenneth C. Smith",
    isbn: "978-0190853464",
    category: "Electronics",
    total_copies: 5,
    available_copies: 5,
    cover_url: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-elec-2",
    title: "Signals and Systems",
    author: "Alan V. Oppenheim, Alan S. Willsky",
    isbn: "978-0138147570",
    category: "Electronics",
    total_copies: 4,
    available_copies: 2,
    cover_url: "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-elec-3",
    title: "Power Electronics: Converters, Applications, and Design",
    author: "Ned Mohan",
    isbn: "978-0471226932",
    category: "Electrical",
    total_copies: 4,
    available_copies: 3,
    cover_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-math-1",
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    isbn: "978-1285741550",
    category: "Mathematics",
    total_copies: 10,
    available_copies: 8,
    cover_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-math-2",
    title: "Engineering Mathematics",
    author: "K.A. Stroud, Dexter J. Booth",
    isbn: "978-1137031204",
    category: "Mathematics",
    total_copies: 8,
    available_copies: 6,
    cover_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-math-3",
    title: "Linear Algebra and Its Applications",
    author: "David C. Lay",
    isbn: "978-0321982384",
    category: "Mathematics",
    total_copies: 6,
    available_copies: 4,
    cover_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-phy-1",
    title: "University Physics with Modern Physics",
    author: "Hugh D. Young, Roger A. Freedman",
    isbn: "978-0135159552",
    category: "Physics",
    total_copies: 6,
    available_copies: 4,
    cover_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-phy-2",
    title: "Physics for Scientists and Engineers",
    author: "Raymond A. Serway, John W. Jewett",
    isbn: "978-1305952300",
    category: "Physics",
    total_copies: 5,
    available_copies: 2,
    cover_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-lit-1",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-1503280786",
    category: "Literature",
    total_copies: 7,
    available_copies: 5,
    cover_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-lit-2",
    title: "Hamlet",
    author: "William Shakespeare",
    isbn: "978-0486272788",
    category: "Literature",
    total_copies: 6,
    available_copies: 3,
    cover_url: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-biz-1",
    title: "Principles of Corporate Finance",
    author: "Richard A. Brealey, Stewart C. Myers",
    isbn: "978-1260013900",
    category: "Business",
    total_copies: 4,
    available_copies: 3,
    cover_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-biz-2",
    title: "Fundamentals of Financial Management",
    author: "Eugene F. Brigham, Joel F. Houston",
    isbn: "978-0357517745",
    category: "Business",
    total_copies: 5,
    available_copies: 4,
    cover_url: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-mgt-1",
    title: "Principles of Management",
    author: "Koontz, Weihrich",
    isbn: "978-0071121968",
    category: "Management",
    total_copies: 5,
    available_copies: 2,
    cover_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-mgt-2",
    title: "Marketing Management",
    author: "Philip Kotler, Kevin Lane Keller",
    isbn: "978-0132102926",
    category: "Management",
    total_copies: 4,
    available_copies: 3,
    cover_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-mech-1",
    title: "Engineering Thermodynamics",
    author: "P.K. Nag",
    isbn: "978-0070647739",
    category: "Mechanical",
    total_copies: 6,
    available_copies: 4,
    cover_url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-mech-2",
    title: "Fluid Mechanics",
    author: "Frank M. White",
    isbn: "978-0073398273",
    category: "Mechanical",
    total_copies: 5,
    available_copies: 3,
    cover_url: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-civil-1",
    title: "Structural Analysis",
    author: "R.C. Hibbeler",
    isbn: "978-0133944558",
    category: "Civil",
    total_copies: 5,
    available_copies: 4,
    cover_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-civil-2",
    title: "Soil Mechanics and Foundations",
    author: "Muni Budhu",
    isbn: "978-0470556849",
    category: "Civil",
    total_copies: 4,
    available_copies: 2,
    cover_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-gen-1",
    title: "English Grammar in Use",
    author: "Raymond Murphy",
    isbn: "978-1108457651",
    category: "General",
    total_copies: 9,
    available_copies: 7,
    cover_url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "book-gen-2",
    title: "A Handbook of Communication Skills",
    author: "S. K. Verma",
    isbn: "978-9385942204",
    category: "General",
    total_copies: 6,
    available_copies: 5,
    cover_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&auto=format&fit=crop&q=60",
  },
];

const SUBJECT_BOOKS = {
  Programming: ["C", "C++", "Java", "Python", "JavaScript"],
  "Data Structures": ["Data Structures", "Algorithms", "Problem Solving"],
  Databases: ["DBMS", "SQL", "Distributed Databases"],
  "Web Development": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
  "AI & ML": ["Artificial Intelligence", "Machine Learning", "Deep Learning"],
  Cloud: ["Cloud Computing", "AWS", "Azure", "Distributed Systems"],
  Cybersecurity: ["Network Security", "Cryptography", "Ethical Hacking"],
  "Computer Networks": ["Computer Networks", "TCP/IP", "Network Administration"],
  "Operating Systems": ["OS", "Linux", "System Programming"],
  "Software Engineering": ["Software Engineering", "Design Patterns", "Testing"],
  IoT: ["Internet of Things", "Embedded Systems", "Sensors"],
  "Data Science": ["Statistics", "Data Analysis", "Data Visualization"],
  "Computer Architecture": ["Computer Organization", "Microprocessors"],
  "Mobile Development": ["Android", "Flutter", "Mobile Computing"],
  "Emerging Tech": ["Blockchain", "Quantum Computing", "AR/VR"],
};

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Management Studies (MBA)",
];

export const STUDY_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgraduate",
];

/**
 * Returns clean alphanumeric ISBN without hyphens or spaces
 */
export function cleanIsbnString(isbn) {
  if (!isbn) return "";
  return String(isbn).replace(/[^0-9X]/gi, "");
}

/**
 * Returns Open Library Covers API URL for given ISBN
 * @param {string} isbn
 * @param {'S'|'M'|'L'} size - S (small), M (medium), L (large)
 */
export function getOpenLibraryCoverUrl(isbn, size = "M") {
  const clean = cleanIsbnString(isbn);
  if (!clean) return "";
  return `https://covers.openlibrary.org/b/isbn/${clean}-${size}.jpg`;
}

/**
 * Resolves best cover URL for a book record
 */
export function getBookCover(book, size = "M") {
  if (!book) return "";
  const coverUrl = book.cover_url || (book.cover_image_url ? book.cover_image_url : "");
  if (coverUrl && coverUrl.trim()) return coverUrl;
  if (book.isbn && /^OPEN-\d{3}$/i.test(book.isbn.trim())) {
    return `/book-covers/${book.isbn.trim().toLowerCase()}.svg`;
  }
  if (book.isbn) return getOpenLibraryCoverUrl(book.isbn, size);
  return "";
}

export function getBookFallbackCover(book) {
  if (!book) return "";
  const title = String(book.title || "Technical Book").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  }[character]));
  const author = String(book.author || "Unknown Author").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  }[character]));
  const category = String(book.category || "Technical Library").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  }[character]));
  const hash = String(book.isbn || book.id || title).split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  const accent = `hsl(${hash % 360} 75% 55%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#111827"/><path d="M0 0h300v400H0z" fill="${accent}" opacity=".22"/><path d="M35 55h230M35 75h150M35 285h230" stroke="${accent}" stroke-width="5"/><text x="35" y="120" fill="white" font-family="sans-serif" font-size="12">${category}</text><text x="35" y="175" fill="white" font-family="sans-serif" font-size="25" font-weight="700">${title.slice(0, 24)}</text><text x="35" y="215" fill="white" font-family="sans-serif" font-size="25" font-weight="700">${title.slice(24, 48)}</text><text x="35" y="335" fill="#d1d5db" font-family="sans-serif" font-size="14">${author.slice(0, 34)}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Auto-fetches book details (title, authors, cover) from Open Library API by ISBN
 */
export async function fetchBookByIsbn(isbn) {
  const clean = cleanIsbnString(isbn);
  if (!clean) throw new Error("Please enter a valid ISBN number.");

  try {
    const res = await fetch(`https://openlibrary.org/isbn/${clean}.json`);
    if (!res.ok) {
      // Fallback: try open library books API
      const altRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=data`);
      if (altRes.ok) {
        const altData = await altRes.json();
        const bookData = altData[`ISBN:${clean}`];
        if (bookData) {
          return {
            title: bookData.title || "",
            author: bookData.authors?.map((a) => a.name).join(", ") || "",
            cover_url: bookData.cover?.large || bookData.cover?.medium || getOpenLibraryCoverUrl(clean, "L"),
            category: bookData.subjects?.[0]?.name || "General",
            isbn: isbn,
          };
        }
      }
      throw new Error("No book metadata found for this ISBN in Open Library.");
    }

    const data = await res.json();
    let authorName = "";

    // Fetch author if author reference exists
    if (data.authors && data.authors.length > 0) {
      const authorKey = data.authors[0].key;
      try {
        const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`);
        if (authorRes.ok) {
          const authorData = await authorRes.json();
          authorName = authorData.name || "";
        }
      } catch (e) {
        console.warn("Could not fetch author name:", e);
      }
    }

    return {
      title: data.title || "",
      author: authorName || "Unknown Author",
      cover_url: getOpenLibraryCoverUrl(clean, "L"),
      category: "Computer Science",
      isbn: isbn,
    };
  } catch (error) {
    console.error("Open Library lookup error:", error);
    throw error;
  }
}

