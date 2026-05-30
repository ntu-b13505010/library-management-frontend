import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchLibraryBooks } from '../services/bookService.js';
import { borrowLibraryBook } from '../services/borrowService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function SearchBooksPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const loadBooks = async (searchKeyword = keyword) => {
    setIsLoading(true);
    const result = await searchLibraryBooks(searchKeyword);
    setBooks(result.data);
    setSelectedBookId(null);
    setIsLoading(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');

    if (!storedUser) {
      navigate('/login');
      return;
    }

    // 學生功能頁需要登入後才能使用。
    setCurrentUser(JSON.parse(storedUser));
    loadBooks('');
  }, [navigate]);

  const selectedBook = books.find((book) => book.book_id === selectedBookId);
  const availableCount = books.filter((book) => book.status === 'AVAILABLE').length;
  const borrowedCount = books.filter((book) => book.status === 'BORROWED').length;

  const handleSearch = async (event) => {
    event.preventDefault();
    setMessage('');
    await loadBooks(keyword);
  };

  const handleBorrow = async () => {
    if (!selectedBook) {
      setMessageType('error');
      setMessage('Please select a book first.');
      return;
    }

    const result = await borrowLibraryBook(currentUser.user_id, selectedBook.book_id);
    setMessageType(result.success ? 'success' : 'error');
    setMessage(result.message);

    if (result.success) {
      await loadBooks(keyword);
    }
  };

  const handleViewHistory = () => {
    if (!selectedBook) {
      setMessageType('error');
      setMessage('Please select a book first.');
      return;
    }

    navigate(`/student/book-borrow-history/${selectedBook.book_id}`);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <main className="app-shell workspace-shell">
      <PageCard className="feature-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Student Library</p>
            <h1>Search Books</h1>
            <p className="page-intro">Search the mock catalog and borrow available books.</p>
          </div>
          <div className="mini-summary">
            {books.length} shown · {availableCount} available · {borrowedCount} borrowed
          </div>
        </div>

        <form className="toolbar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search title, author, subject, publisher, ISBN"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <AppButton type="submit">Search</AppButton>
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
                <th>ID</th>
                <th>Title</th>
                <th>Authors</th>
                <th>Subjects</th>
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
                  <td>
                    <span className={`status-pill status-pill--${book.status.toLowerCase()}`}>
                      {book.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && books.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      No books found. Try a different title, author, subject, publisher, or ISBN.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="page-actions">
          <AppButton onClick={handleBorrow}>Borrow Selected Book</AppButton>
          <AppButton variant="secondary" onClick={handleViewHistory}>
            View Book Borrow History
          </AppButton>
          <AppButton variant="secondary" onClick={() => navigate('/student')}>
            Back
          </AppButton>
        </div>
      </PageCard>
    </main>
  );
}

export default SearchBooksPage;
