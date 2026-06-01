import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchLibraryBooks } from '../services/bookService.js';
import { borrowLibraryBook } from '../services/borrowService.js';
import { reserveLibraryBook } from '../services/reservationService.js';
import AppButton from '../components/AppButton.jsx';
import PageCard from '../components/PageCard.jsx';

function SearchBooksPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);

  const loadBooks = async (searchKeyword = keyword) => {
    setIsLoading(true);
    const result = await searchLibraryBooks(searchKeyword, searchField);
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
  const reservedCount = books.filter((book) => book.status === 'RESERVED').length;

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

  const handleReserve = async () => {
    if (!selectedBook) {
      setMessageType('error');
      setMessage('Please select a book first.');
      return;
    }

    if (selectedBook.status === 'RESERVED' || selectedBook.has_waiting_reservation) {
      setMessageType('error');
      setMessage('This borrowed book already has a waiting reservation.');
      return;
    }

    if (selectedBook.status !== 'BORROWED') {
      setMessageType('error');
      setMessage('Only borrowed books can be reserved.');
      return;
    }

    const result = await reserveLibraryBook(currentUser.user_id, selectedBook.book_id);
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

  const handleViewDetail = () => {
    if (!selectedBook) {
      setMessageType('error');
      setMessage('Please select a book first.');
      return;
    }

    navigate(`/student/books/${selectedBook.book_id}`);
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
            <p className="page-intro">
              Search the mock catalog by title, author, subject, publisher, or ISBN.
            </p>
          </div>
          <div className="mini-summary">
            {books.length} shown · {availableCount} available · {borrowedCount} borrowed ·{' '}
            {reservedCount} reserved
          </div>
        </div>

        <form className="toolbar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter keyword"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <select
            aria-label="Search field"
            value={searchField}
            onChange={(event) => setSearchField(event.target.value)}
          >
            <option value="all">All Fields</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="subject">Subject</option>
            <option value="publisher">Publisher</option>
            <option value="isbn">ISBN</option>
          </select>
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
                <th>Publisher</th>
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
                  <td>
                    <span className={`status-pill status-pill--${book.status.toLowerCase()}`}>
                      {book.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && books.length === 0 && (
                <tr>
                  <td colSpan="6">
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
          <AppButton
            onClick={handleBorrow}
            disabled={!selectedBook || selectedBook.status !== 'AVAILABLE'}
          >
            Borrow Selected Book
          </AppButton>
          <AppButton
            variant="secondary"
            onClick={handleReserve}
            disabled={
              !selectedBook || selectedBook.status !== 'BORROWED' || selectedBook.has_waiting_reservation
            }
          >
            Reserve Selected Book
          </AppButton>
          <AppButton variant="secondary" onClick={handleViewDetail}>
            View Detail
          </AppButton>
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
