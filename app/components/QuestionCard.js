"use client";

export default function QuestionCard({ q, status, onAccept, onReject, onEdit, onRegenerate }) {
  const statusTag = status === "accepted" ? <span className="tag ok">accepted</span>
                   : status === "rejected" ? <span className="tag bad">rejected</span>
                   : <span className="tag warn">open</span>;

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
        <strong>{q.type === "coderunner" ? "CodeRunner" : "Multiple Choice"}</strong>
        <span className="small">#{q.id} • {q.difficulty || "medium"} • {q.language || "en"} {statusTag}</span>
      </div>
      <div style={{marginTop: 8}} dangerouslySetInnerHTML={{__html: q.text}} />
      {q.type === "multiple-choice" && q.options?.length ? (
        <ul style={{marginTop:8}}>
          {q.options.map((opt, i) => (
            <li key={i} className="small">
              {String.fromCharCode(97+i)}) {opt.text} {opt.correct ? <span className="tag ok">correct</span> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {q.type === "coderunner" && q.answer ? (
        <pre style={{background:"#0b1020", border:"1px solid #1e274a", borderRadius:8, padding:12, overflowX:"auto"}}>
{q.answer}
        </pre>
      ) : null}

      <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
        <button className="btn ok" onClick={() => onAccept(q)}>Accept</button>
        <button className="btn warn" onClick={() => onReject(q.id)}>Reject</button>
        <button className="btn muted" onClick={() => onEdit(q.id)}>Edit</button>
        <button className="btn" onClick={() => onRegenerate(q.id)}>Regenerate</button>
      </div>
    </div>
  );
}
