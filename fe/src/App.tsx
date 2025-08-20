import Header from './components/header';
export default function App() {
  return (
    <div className="min-vh-100 bg-light">
      <Header />
      <main className="container py-5">
        <div className="card shadow-sm border-0">
          <div className="card-body p-5">
            <h1 className="display-6 fw-semibold text-dark">Chào mừng!</h1>
            <p className="mt-2 text-muted">
              Menu phía trên sẽ chỉ hiển thị các mục mà tài khoản của bạn có
              quyền.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
