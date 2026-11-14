// Popup bảng phép tính của cổng: tự hiện khi chơi xong, hoặc khi giáo viên bấm "Qua cổng" ở dải cổng.
import { useState, type CSSProperties } from 'react';
import { passGate } from './gateBridge';
import { gateNumber, STATIONS, type GateId } from './logic';
import { defaultRecap, type RecapColumn, type RecapRow } from './recap';
import { BookLine } from '../games/flower/FlowerGame';
import { pickedOf } from '../games/flower/logic';
import { useTour } from './store';

/** Phép chưa làm ("?") bấm vào thì hiện đáp án đúng, tô khác màu với phép học sinh đã tự làm. */
function Row({ r, i }: { r: RecapRow; i: number }) {
  const [revealed, setRevealed] = useState(false);
  // Bài 2: ô khác mục tiêu (highlight === false) đánh dấu ✘, không dùng ✔ như phép đúng
  const miss = r.highlight === false;
  const cls = r.done ? (r.highlight ? 'done hl' : miss ? 'done miss' : 'done') : revealed ? 'revealed' : 'pending';
  const body = (
    <>
      {r.icon && <span className="rp-icon">{r.icon}</span>}
      <span className="rp-num">{r.a}</span>
      <span className="rp-op">−</span>
      <span className="rp-num">{r.b}</span>
      <span className="rp-op">=</span>
      <span className="rp-res">{r.done || revealed ? r.a - r.b : '?'}</span>
      <span className="rp-mark" aria-hidden>
        {r.done ? (r.highlight ? '🥕' : miss ? '✘' : '✔') : revealed ? '👀' : ''}
      </span>
    </>
  );
  const style = { '--i': i } as CSSProperties;
  if (r.done) {
    return (
      <li className={`rp-row ${cls}`} style={style}>
        {body}
      </li>
    );
  }
  return (
    <li className="rp-li">
      <button
        className={`rp-row ${cls}`}
        style={style}
        onClick={() => setRevealed(true)}
        aria-label={revealed ? `${r.a} trừ ${r.b} bằng ${r.a - r.b}` : `Xem đáp án ${r.a} trừ ${r.b}`}
      >
        {body}
      </button>
    </li>
  );
}

/** Bài 3: bảng trừ hàng dọc như SGK (hàng số bị trừ, hàng số trừ, hàng kết quả); ô "?" bấm vào thì hiện đáp án. */
function VerticalTable({ rows }: { rows: RecapRow[] }) {
  const [revealed, setRevealed] = useState<number[]>([]);
  return (
    <table className="rp-vt">
      <tbody>
        <tr>
          <th rowSpan={2}>−</th>
          {rows.map((r, i) => (
            <td key={i}>{r.a}</td>
          ))}
        </tr>
        <tr>
          {rows.map((r, i) => (
            <td key={i}>{r.b}</td>
          ))}
        </tr>
        <tr className="rp-vt-res">
          <th />
          {rows.map((r, i) =>
            r.done ? (
              <td key={i} className="done">
                {r.a - r.b}
              </td>
            ) : revealed.includes(i) ? (
              <td key={i} className="revealed">
                {r.a - r.b}
              </td>
            ) : (
              <td key={i} className="pending">
                <button onClick={() => setRevealed((v) => [...v, i])} aria-label={`Xem đáp án ${r.a} trừ ${r.b}`}>
                  ?
                </button>
              </td>
            ),
          )}
        </tr>
      </tbody>
    </table>
  );
}

/** Bài 1: mỗi dòng 6 bông hoa (bông bớt đi tô đỏ) và phép tính, giống bảng "Hoàn thành Vườn Hoa"; ô "?" bấm vào thì hiện đáp án. */
function FlowerLines({ rows }: { rows: RecapRow[] }) {
  const [revealed, setRevealed] = useState<number[]>([]);
  return (
    <div className="b1-summary rp-flower">
      {rows.map((r, i) => (
        <BookLine
          key={i}
          q={r}
          picked={pickedOf(r)}
          answer={
            r.done ? undefined : revealed.includes(i) ? (
              <span className="rp-flower-revealed">{r.a - r.b}</span>
            ) : (
              <button className="rp-flower-q" onClick={() => setRevealed((v) => [...v, i])} aria-label={`Xem đáp án ${r.a} trừ ${r.b}`}>
                ?
              </button>
            )
          }
        />
      ))}
    </div>
  );
}

function Column({ c, split }: { c: RecapColumn; split: boolean }) {
  return (
    <div className="rp-col">
      {(c.title || c.target !== undefined) && (
        <div className="rp-col-head">
          {c.title && <b>{c.title} · </b>}
          {c.title ? 'bằng' : 'Tìm phép tính bằng'} <span className="hl-target small">{c.target}</span>
        </div>
      )}
      {c.rows.length === 0 && c.note && <p className="rp-note">{c.note}</p>}
      <ul className={`rp-rows ${split ? 'split' : ''}`}>
        {c.rows.map((r, i) => (
          <Row key={i} r={r} i={i} />
        ))}
      </ul>
    </div>
  );
}

export function RecapPopup({ gate }: { gate: GateId }) {
  const open = useTour((s) => s.recapOpen);
  const done = useTour((s) => s.done);
  const recap = useTour((s) => s.recap);
  if (!open) return null;
  const st = STATIONS.find((s) => s.id === gate)!;
  const data = recap ?? defaultRecap(gate);
  // một cột dài (8 phép của Bài 3) thì chia đôi cho vừa màn chiếu
  const split = data.columns.length === 1 && data.columns[0].rows.length > 5;
  return (
    <div className="overlay rp-overlay">
      <div
        className="rp-box pop-in"
        role="dialog"
        aria-label="Bảng phép tính"
        style={{ '--gate-color': st.color } as CSSProperties}
      >
        <header className="rp-head">
          <div className="rp-title">{done ? '🎉 Cùng đọc lại các phép tính!' : '📋 Các phép tính của cổng'}</div>
          <div className="rp-sub">
            {st.emoji} Cổng {gateNumber(gate)} · {st.title}
          </div>
        </header>
        {gate === 'flower' ? (
          <div className="rp-cols">
            <FlowerLines rows={data.columns[0].rows} />
          </div>
        ) : gate === 'ticket' ? (
          <div className="rp-cols">
            <VerticalTable rows={data.columns[0].rows} />
          </div>
        ) : (
          <div className={`rp-cols cols-${data.columns.length}`}>
            {data.columns.map((c, i) => (
              <Column key={i} c={c} split={split} />
            ))}
          </div>
        )}
        <div className="overlay-actions rp-actions">
          <button className="btn" onClick={() => useTour.getState().setRecapOpen(false)}>
            {done ? '↩ Xem lại' : '↩ Chơi tiếp'}
          </button>
          <button className="btn btn-big btn-primary" onClick={passGate}>
            🚪 Qua cổng
          </button>
        </div>
      </div>
    </div>
  );
}
