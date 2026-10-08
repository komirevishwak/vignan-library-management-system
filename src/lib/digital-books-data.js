/**
 * Digital Books Data & Utilities
 * Comprehensive e-Book library for Vignandhara Library Management System
 */

export const DIGITAL_CATEGORIES = [
  "All",
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

const LEGACY_DIGITAL_BOOKS_SEED = [
  // 1. Software Engineering
  {
    id: "ebook-se-1",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Software Engineering",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. A timeless guide to writing readable, maintainable, and elegant software.",
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/clean-code.pdf",
    file_size_mb: 8.4,
    total_copies_available: 999,
  },
  {
    id: "ebook-se-2",
    title: "The Pragmatic Programmer: Your Journey to Mastery",
    author: "David Thomas, Andrew Hunt",
    isbn: "978-0135957059",
    category: "Software Engineering",
    description: "One of the most significant books on software engineering. It cuts through the increasing specialization and technicalities of modern development to examine the core process.",
    cover_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/pragmatic-programmer.pdf",
    file_size_mb: 6.2,
    total_copies_available: 999,
  },
  {
    id: "ebook-se-3",
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    isbn: "978-0201633610",
    category: "Software Engineering",
    description: "The seminal work by the 'Gang of Four'. Captures 23 classic software design patterns that solve recurring architectural problems in object-oriented software engineering.",
    cover_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/design-patterns.pdf",
    file_size_mb: 11.5,
    total_copies_available: 999,
  },
  {
    id: "ebook-se-4",
    title: "Refactoring: Improving the Design of Existing Code",
    author: "Martin Fowler",
    isbn: "978-0134757599",
    category: "Software Engineering",
    description: "Fowler explains the principles and best practices of refactoring, along with a catalog of proven code transformations to make legacy code clean and extensible.",
    cover_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/refactoring.pdf",
    file_size_mb: 7.8,
    total_copies_available: 999,
  },

  // 2. DBMS (Database Management System)
  {
    id: "ebook-dbms-1",
    title: "Database System Concepts (7th Edition)",
    author: "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
    isbn: "978-0078022159",
    category: "DBMS",
    description: "The authoritative textbook presenting fundamental database management concepts, relational models, relational algebra, SQL, query optimization, and storage management.",
    cover_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/database-system-concepts.pdf",
    file_size_mb: 14.2,
    total_copies_available: 999,
  },
  {
    id: "ebook-dbms-2",
    title: "SQL Performance Explained",
    author: "Markus Winand",
    isbn: "978-3950307825",
    category: "DBMS",
    description: "A fast-paced guide to database indexing and SQL query tuning for developers. Learn how index structures work under the hood across Oracle, PostgreSQL, MySQL, and SQL Server.",
    cover_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/sql-performance-explained.pdf",
    file_size_mb: 4.5,
    total_copies_available: 999,
  },
  {
    id: "ebook-dbms-3",
    title: "Transaction Processing: Concepts and Techniques",
    author: "Jim Gray, Andreas Reuter",
    isbn: "978-1558601901",
    category: "DBMS",
    description: "The foundational classic on ACID transactions, concurrency control, logging, recovery, locking algorithms, and fault-tolerant system architecture by Turing Award winner Jim Gray.",
    cover_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/transaction-processing.pdf",
    file_size_mb: 18.0,
    total_copies_available: 999,
  },
  {
    id: "ebook-dbms-4",
    title: "Database Internals: A Deep Dive into How Distributed Systems Work",
    author: "Alex Petrov",
    isbn: "978-1492040347",
    category: "DBMS",
    description: "Comprehensive breakdown of internal storage engines (B-Trees, LSM-trees, buffer pools), write-ahead logging, and distributed replication primitives.",
    cover_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/database-internals.pdf",
    file_size_mb: 9.3,
    total_copies_available: 999,
  },

  // 3. Distributed Database Management Systems
  {
    id: "ebook-ddbms-1",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    isbn: "978-1449373320",
    category: "Distributed Database Management Systems",
    description: "An extraordinary tour through data systems: replication, partitioning, transactions, consensus, stream processing, and building reliable, scalable, and maintainable systems.",
    cover_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/designing-data-intensive-applications.pdf",
    file_size_mb: 15.6,
    total_copies_available: 999,
  },
  {
    id: "ebook-ddbms-2",
    title: "The Art of Distributed Systems",
    author: "Arpit Bhayani",
    isbn: "978-9356281905",
    category: "Distributed Database Management Systems",
    description: "Clear, practical explanations of distributed hashing, gossip protocols, vector clocks, quorum sensing, Raft consensus, and real-world high-throughput distributed architectures.",
    cover_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/art-of-distributed-systems.pdf",
    file_size_mb: 5.1,
    total_copies_available: 999,
  },
  {
    id: "ebook-ddbms-3",
    title: "Consistency Models and Consensus Protocols",
    author: "Leslie Lamport, Jim Dowling",
    isbn: "978-0262539401",
    category: "Distributed Database Management Systems",
    description: "Deep dive into linearizability, sequential consistency, eventual consistency, Paxos, Multi-Paxos, and Raft consensus algorithms in modern cloud databases.",
    cover_url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/consistency-models-consensus.pdf",
    file_size_mb: 7.4,
    total_copies_available: 999,
  },
  {
    id: "ebook-ddbms-4",
    title: "Distributed Systems: Principles and Paradigms",
    author: "Andrew S. Tanenbaum, Maarten van Steen",
    isbn: "978-1543057386",
    category: "Distributed Database Management Systems",
    description: "Classic authoritative treatise covering communication, processes, naming, synchronization, fault tolerance, and distributed file/database architectures.",
    cover_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/distributed-systems-tanenbaum.pdf",
    file_size_mb: 13.0,
    total_copies_available: 999,
  },

  // 4. Machine Learning
  {
    id: "ebook-ml-1",
    title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow",
    author: "Aurélien Géron",
    isbn: "978-1098125974",
    category: "Machine Learning",
    description: "Through a series of recent breakthroughs, deep learning has boosted the entire field of machine learning. A comprehensive, concrete hands-on textbook with intuitive code and math.",
    cover_url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/hands-on-machine-learning.pdf",
    file_size_mb: 16.5,
    total_copies_available: 999,
  },
  {
    id: "ebook-ml-2",
    title: "Deep Learning (Adaptive Computation and Machine Learning)",
    author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
    isbn: "978-0262035613",
    category: "Machine Learning",
    description: "The definitive MIT Press deep learning bible. Covers mathematical foundations, linear algebra, deep feedforward networks, regularization, optimization, CNNs, and RNNs.",
    cover_url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/deep-learning-goodfellow.pdf",
    file_size_mb: 19.8,
    total_copies_available: 999,
  },
  {
    id: "ebook-ml-3",
    title: "An Introduction to Statistical Learning (with Applications in R & Python)",
    author: "Gareth James, Daniela Witten, Trevor Hastie, Robert Tibshirani",
    isbn: "978-1071614174",
    category: "Machine Learning",
    description: "A vital reference for statistical learning, covering regression, classification, resampling, tree-based models, support vector machines, unsupervised learning, and deep learning.",
    cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/statistical-learning.pdf",
    file_size_mb: 10.2,
    total_copies_available: 999,
  },
  {
    id: "ebook-ml-4",
    title: "Machine Learning Yearning: Technical Strategy for AI Engineers",
    author: "Andrew Ng",
    isbn: "978-0999804704",
    category: "Machine Learning",
    description: "AI Pioneer Andrew Ng teaches how to structure Machine Learning projects, identify bias/variance bottlenecks, prioritize error analysis, and deploy high-performing models rapidly.",
    cover_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80",
    file_url: "/ebooks/machine-learning-yearning.pdf",
    file_size_mb: 4.8,
    total_copies_available: 999,
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

export const DIGITAL_BOOKS_SEED = [
  // The technical catalog is authoritative in public.books and is imported from SQL.
];

/**
 * Calculates days remaining, status, and percent of 14-day duration used
 * @param {string|Date} dueDate
 * @param {string|Date} [borrowedDate]
 * @returns {{ daysRemaining: number, isExpired: boolean, percentUsed: number }}
 */
export function calculateDigitalLoanRemaining(dueDate, borrowedDate = null) {
  if (!dueDate) return { daysRemaining: 0, isExpired: true, percentUsed: 100 };

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const totalDurationMs = 14 * 24 * 60 * 60 * 1000;
  const start = borrowedDate ? new Date(borrowedDate) : new Date(due.getTime() - totalDurationMs);
  const elapsedMs = Math.max(0, now.getTime() - start.getTime());
  const percentUsed = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

  return {
    daysRemaining,
    isExpired: diffMs <= 0,
    percentUsed,
  };
}

/**
 * Generates a valid PDF 1.4 binary buffer for a given digital book
 * Compatible with all modern browser PDF viewers, Adobe Reader, and pdf.js
 * @param {object} book
 * @returns {Buffer}
 */
export function generateEbookPdf(book) {
  const title = book?.title || "Digital Book";
  const author = book?.author || "Vignandhara Academic Press";
  const category = book?.category || "Computer Science";
  const isbn = book?.isbn || "N/A";
  const desc = (book?.description || "College Library Digital Edition.").replace(/[\r\n]+/g, " ");

  // Escape special PDF characters
  const escapePdf = (str) =>
    String(str)
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");

  const safeTitle = escapePdf(title);
  const safeAuthor = escapePdf(author);
  const safeCategory = escapePdf(category);
  const safeIsbn = escapePdf(isbn);
  const safeDesc = escapePdf(desc);

  // Content Stream for Page 1: Cover & Metadata
  const page1Content = `
q
0.12 0.23 0.37 rg
0 0 612 792 re
f
Q
q
1 1 1 rg
BT
/F1 24 Tf
50 680 Td
(VIGNANDHARA DIGITAL LIBRARY) Tj
ET
0.9 0.9 0.95 rg
BT
/F2 12 Tf
50 655 Td
(Official College Digital e-Book Loan - 14 Days Authorized Access) Tj
ET
Q
q
0.05 0.58 0.41 rg
50 620 512 4 re
f
Q
q
1 1 1 rg
BT
/F1 20 Tf
50 560 Td
(${safeTitle.substring(0, 50)}) Tj
ET
${safeTitle.length > 50 ? `
BT
/F1 20 Tf
50 535 Td
(${safeTitle.substring(50, 100)}) Tj
ET
` : ""}
0.8 0.85 0.9 rg
BT
/F2 14 Tf
50 490 Td
(Author: ${safeAuthor}) Tj
ET
BT
/F2 12 Tf
50 465 Td
(Domain / Category: ${safeCategory}) Tj
ET
BT
/F2 12 Tf
50 440 Td
(ISBN: ${safeIsbn}) Tj
ET
0.95 0.95 0.95 rg
BT
/F2 11 Tf
50 390 Td
(Summary & Overview:) Tj
ET
BT
/F2 10 Tf
50 365 Td
(${safeDesc.substring(0, 80)}) Tj
ET
${safeDesc.length > 80 ? `
BT
/F2 10 Tf
50 348 Td
(${safeDesc.substring(80, 160)}) Tj
ET
` : ""}
${safeDesc.length > 160 ? `
BT
/F2 10 Tf
50 331 Td
(${safeDesc.substring(160, 240)}) Tj
ET
` : ""}
Q
q
0.1 0.7 0.5 rg
50 250 512 40 re
f
0 0 0 rg
BT
/F1 11 Tf
70 268 Td
(ACTIVE BORROWED LICENSE: Authorized for personal study and reference.) Tj
ET
Q
q
0.6 0.6 0.6 rg
BT
/F2 9 Tf
50 60 Td
(Vignandhara College of Engineering & Technology - Library Management System) Tj
ET
Q
`.trim();

  // Content Stream for Page 2: Chapter 1 & Reading Material
  const page2Content = `
q
BT
/F1 18 Tf
50 720 Td
(Chapter 1: Foundational Principles & Architecture) Tj
ET
0.2 0.4 0.8 rg
50 705 512 2 re
f
0 0 0 rg
BT
/F2 11 Tf
50 660 Td
(Welcome to the digital edition of ${safeTitle}.) Tj
0 -22 Td
(This digital copy is made available to enrolled students for an active 14-day study window.) Tj
0 -22 Td
(Key Topics Covered in this Volume:) Tj
0 -20 Td
(  1. Core theoretical foundations, abstractions, and standard methodologies.) Tj
0 -18 Td
(  2. Architectural trade-offs, scaling considerations, and real-world system design.) Tj
0 -18 Td
(  3. Practical case studies, performance benchmarks, and implementation patterns.) Tj
0 -18 Td
(  4. Algorithmic invariants, state models, and reliability guarantees.) Tj
0 -28 Td
(Study Guidelines:) Tj
0 -18 Td
(- Take notes in your digital workspace while reading.) Tj
0 -18 Td
(- When finished with your studies, you can click 'End Reading' to release the slot for classmates.) Tj
0 -18 Td
(- All loans expire automatically after 14 days without late fines.) Tj
ET
0.5 0.5 0.5 rg
BT
/F2 9 Tf
50 40 Td
(Page 2 of 2 | Vignandhara LMS Digital Books Collection) Tj
ET
Q
`.trim();

  // Assemble Objects
  const pdfString = [
    "%PDF-1.4",
    "1 0 obj",
    "<< /Type /Catalog /Pages 2 0 R >>",
    "endobj",
    "2 0 obj",
    "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>",
    "endobj",
    "3 0 obj",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >>`,
    "endobj",
    "4 0 obj",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >>`,
    "endobj",
    "5 0 obj",
    `<< /Length ${Buffer.byteLength(page1Content)} >>`,
    "stream",
    page1Content,
    "endstream",
    "endobj",
    "6 0 obj",
    `<< /Length ${Buffer.byteLength(page2Content)} >>`,
    "stream",
    page2Content,
    "endstream",
    "endobj",
    "7 0 obj",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    "endobj",
    "8 0 obj",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "endobj",
  ];

  let body = pdfString.join("\n") + "\n";
  const offsets = [];
  const lines = body.split("\n");
  let currentOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([0-9]+)\s+0\s+obj/);
    if (match) {
      const objNum = parseInt(match[1], 10);
      offsets[objNum] = currentOffset;
    }
    currentOffset += Buffer.byteLength(line, "latin1") + 1;
  }

  const xrefStart = Buffer.byteLength(body, "latin1");
  let xref = "xref\n0 9\n0000000000 65535 f \n";
  for (let i = 1; i <= 8; i++) {
    const off = String(offsets[i] || 0).padStart(10, "0");
    xref += `${off} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(body + xref + trailer, "latin1");
}
