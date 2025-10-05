"use client";

export default function StatusSummary({ total, accepted, rejected }) {
  return (
    <div className="card">
      <div className="section-title">Status</div>
      <div className="small">
        Generated: <strong>{total}</strong> &nbsp;•&nbsp;
        Accepted: <strong>{accepted}</strong> &nbsp;•&nbsp;
        Rejected: <strong>{rejected}</strong>
      </div>
    </div>
  );
}
