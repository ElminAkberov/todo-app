import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <div className="not-found">
      <h1 className="not-found__code">404</h1>
      <p className="not-found__text">This page does not exist.</p>
      <Link className="not-found__link" to="/">
        Back to your tasks
      </Link>
    </div>
  )
}

export default NotFoundPage
