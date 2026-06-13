import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addLibraryBook,
  getAdminBooks,
  removeLibraryBook,
  restoreLibraryBook,
} from '../services/adminService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

const initialBookForm = {
  title: '',
  authors: '',
  subjects: '',
  publisher: '',
  publish_year: '',
  edition: '',
  isbn: '',
};

function ManageBooksPage() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [bookForm, setBookForm] = useState(initialBookForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const loadBooks = async (searchKeyword = keyword) => {
    setIsLoading(true);
    const result = await getAdminBooks(searchKeyword);
    setBooks(result.data);
    setSelectedBookId((currentId) =>
      result.data.some((book) => book.book_id === currentId) ? currentId : null,
    );
    setIsLoading(false);
  };

  useEffect(() => {
    const storedAdmin = localStorage.getItem('currentAdmin');

    if (!storedAdmin) {
      navigate('/login');
      return;
    }

    setCurrentAdmin(JSON.parse(storedAdmin));
    loadBooks('');
  }, [navigate]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setBookForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setMessage('');
  };

  const availableCount = books.filter((book) => book.status === 'AVAILABLE').length;
  const borrowedCount = books.filter((book) => book.status === 'BORROWED').length;
  const reservedCount = books.filter((book) => book.status === 'RESERVED').length;
  const removedCount = books.filter((book) => book.status === 'REMOVED').length;

  const handleSearch = async (event) => {
    event.preventDefault();
    setMessage('');
    await loadBooks(keyword);
  };

  const handleAddBook = async (event) => {
    event.preventDefault();

    if (!bookForm.title.trim()) {
      setMessageType('error');
      setMessage('Title is required.');
      return;
    }

    // 新增書籍只寫入前端 mock data。
    const result = await addLibraryBook({
      ...bookForm,
      title: bookForm.title.trim(),
      publish_year: bookForm.publish_year ? Number(bookForm.publish_year) : '',
    });

    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      setBookForm(initialBookForm);
      await loadBooks();
    }
  };

  const handleRemoveBook = async () => {
    if (!selectedBookId) {
      setMessageType('error');
      setMessage('Please select a book first.');
      return;
    }

    const result = await removeLibraryBook(selectedBookId);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      await loadBooks();
    }
  };

  const handleRestoreBook = async () => {
    if (!selectedBookId) {
      setMessageType('error');
      setMessage('Please select a book first.');
      return;
    }

    const result = await restoreLibraryBook(selectedBookId);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      await loadBooks();
    }
  };

  if (!currentAdmin) {
    return null;
  }

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="feature-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Admin Library</p>
            <h1>Manage Books</h1>
            <p className="page-intro">Add new mock books or mark available books as removed.</p>
          </div>
          <div className="mini-summary">
            {availableCount} available · {borrowedCount} borrowed · {reservedCount} reserved ·{' '}
            {removedCount} removed
          </div>
        </div>

        <form className="toolbar" onSubmit={handleSearch}>
          <input
            type="search"
            aria-label="Search books"
            placeholder="Search by keyword"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <AppButton type="submit">Search</AppButton>
        </form>

        <form className="admin-form-grid" onSubmit={handleAddBook}>
          <div className="form-section-title">Add Book</div>
          <label>
            Title
            <input
              type="text"
              name="title"
              placeholder="Book title"
              value={bookForm.title}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Authors
            <input
              type="text"
              name="authors"
              placeholder="Authors"
              value={bookForm.authors}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Subjects
            <input
              type="text"
              name="subjects"
              placeholder="Subjects"
              value={bookForm.subjects}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Publisher
            <input
              type="text"
              name="publisher"
              placeholder="Publisher"
              value={bookForm.publisher}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Publish Year
            <input
              type="number"
              name="publish_year"
              placeholder="Publish year"
              value={bookForm.publish_year}
              onChange={handleFormChange}
            />
          </label>
          <label>
            Edition
            <input
              type="text"
              name="edition"
              placeholder="Edition"
              value={bookForm.edition}
              onChange={handleFormChange}
            />
          </label>
          <label>
            ISBN
            <input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={bookForm.isbn}
              onChange={handleFormChange}
            />
          </label>
          <div className="admin-form-actions">
            <AppButton type="submit">Add Book</AppButton>
          </div>
        </form>

        {message && (
          <p
            className={
              messageType === 'success'
                ? 'form-message form-message--success'
                : 'form-message form-message--error'
            }
          >
            {message}
          </p>
        )}

        {isLoading && <p className="loading-text">Loading...</p>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Title</th>
                <th>Authors</th>
                <th>Subjects</th>
                <th>Publisher</th>
                <th>Publish Year</th>
                <th>Edition</th>
                <th>ISBN</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr
                  className={selectedBookId === book.book_id ? 'selected-row' : ''}
                  key={book.book_id}
                  onClick={() => setSelectedBookId(book.book_id)}
                >
                  <td>{book.book_id}</td>
                  <td>{book.title}</td>
                  <td>{book.authors}</td>
                  <td>{book.subjects}</td>
                  <td>{book.publisher}</td>
                  <td>{book.publish_year}</td>
                  <td>{book.edition}</td>
                  <td>{book.isbn}</td>
                  <td>
                    <span className={`status-pill status-pill--${book.status.toLowerCase()}`}>
                      {book.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && books.length === 0 && (
                <tr>
                  <td colSpan="9">
                    <div className="empty-state">No matching records found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="page-actions">
          <AppButton variant="secondary" onClick={() => loadBooks(keyword)}>
            Refresh
          </AppButton>
          <AppButton onClick={handleRemoveBook}>Remove Selected Book</AppButton>
          <AppButton onClick={handleRestoreBook}>Restore Selected Book</AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/admin')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default ManageBooksPage;
