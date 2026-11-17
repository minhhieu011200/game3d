// Popup bảng phép tính của cổng: tự hiện khi chơi xong, hoặc khi giáo viên bấm "Qua cổng" ở dải cổng.
import { useState, type CSSProperties } from 'react';
import { passGate } from './gateBridge';
import { gateNumber, STATIONS, type GateId } from './logic';
import { defaultRecap, KIND_ICON, type RecapColumn, type RecapRow } from './recap';
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

const Carrot = () => (
  <svg className="ws-carrot" viewBox="0 0 70 110" aria-hidden>
    <path d="M35 30 L22 4 M35 30 L35 0 M35 30 L48 4" stroke="#2f9e44" strokeWidth="7" strokeLinecap="round" />
    <path d="M12 34 Q35 22 58 34 L38 106 Q35 110 32 106 Z" fill="#fd7e14" stroke="#c2410c" strokeWidth="3" />
    <path d="M22 52 L32 54 M40 70 L48 68 M28 84 L36 86" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/** Bài 2: thẻ giống "Phiếu bài tập số 1" – cà rốt, phép tính, hai ô Đúng / Sai (ô đúng có dấu ✓); thẻ chưa làm bấm vào thì hiện đáp án. */
function SheetCard({ r, i, target }: { r: RecapRow; i: number; target: number }) {
  const [revealed, setRevealed] = useState(false);
  const shown = r.done || revealed;
  const equal = r.a - r.b === target;
  const tick = (yes: boolean) => (shown && equal === yes ? '✓' : '');
  const body = (
    <>
      <span className="ws-top">
        <span className="ws-no">{i + 1}</span>
        <Carrot />
        <span className="ws-eq">
          {r.a} − {r.b} = <span className="ws-res">{shown ? r.a - r.b : '?'}</span>
        </span>
      </span>
      <span className="ws-ticks">
        <span className="ws-tick yes">
          <span className="ws-box">{tick(true)}</span>Đúng
        </span>
        <span className="ws-tick no">
          <span className="ws-box">{tick(false)}</span>Sai
        </span>
      </span>
    </>
  );
  const cls = `ws-card ${r.done ? 'done' : revealed ? 'revealed' : 'pending'}`;
  if (r.done || revealed) return <li className={cls}>{body}</li>;
  return (
    <li className="ws-li">
      <button className={cls} onClick={() => setRevealed(true)} aria-label={`Xem đáp án ${r.a} trừ ${r.b}`}>
        {body}
      </button>
    </li>
  );
}

function SheetColumn({ c }: { c: RecapColumn }) {
  return (
    <div className="rp-col">
      <div className="rp-col-head">
        {c.title && <b>{c.title} · </b>}
        {c.title ? 'bằng' : 'Tìm phép tính bằng'} <span className="hl-target small">{c.target}</span>
      </div>
      {c.rows.length === 0 && c.note && <p className="rp-note">{c.note}</p>}
      <ul className="ws-grid">
        {c.rows.map((r, i) => (
          <SheetCard key={i} r={r} i={i} target={c.target ?? 0} />
        ))}
      </ul>
    </div>
  );
}

/** Bài 4: hình bên phải theo đúng thứ tự trên "Phiếu bài tập số 3" (trứng, ếch, cò). */
const MATCH_PICS = [
  { icon: KIND_ICON.egg, src: './images/bai4-trung.png', alt: 'Ổ trứng có 3 gà con vừa nở' },
  { icon: KIND_ICON.frog, src: './images/bai4-ech.png', alt: '5 chú ếch nhảy xuống nước' },
  { icon: KIND_ICON.stork, src: './images/bai4-co.png', alt: '2 con cò bay lên trời' },
];

/** Bài 4: kết quả của phiếu nối – phép tính bên trái, hình bên phải, đường nối hiện khi đã có đáp án; "?" bấm vào thì hiện. */
/**
 * Phép tính luôn có kết quả (như phiếu); đường nối chỉ hiện khi đã có đáp án, phép chưa có thì bấm vào để hiện.
 * `sheet`: dùng làm "Phiếu bài tập số 3" trên màn hình – không có đường nối, học sinh tự nối.
 */
export function MatchLines({ rows, sheet = false }: { rows: RecapRow[]; sheet?: boolean }) {
  const [revealed, setRevealed] = useState<number[]>([]);
  const shown = (i: number) => !sheet && (rows[i].done || revealed.includes(i));
  return (
    <div className="mt">
      {rows.map((r, i) => {
        const body = (
          <>
            {r.a} − {r.b} = <span className="mt-res">{r.a - r.b}</span>
            <span className="mt-dot" />
          </>
        );
        const cls = `mt-eq ${sheet ? '' : r.done ? 'done' : shown(i) ? 'revealed' : 'pending'}`;
        return sheet || shown(i) ? (
          <div key={i} className={cls} style={{ gridRow: i + 1 }}>
            {body}
          </div>
        ) : (
          <button
            key={i}
            className={cls}
            style={{ gridRow: i + 1 }}
            onClick={() => setRevealed((v) => [...v, i])}
            aria-label={`Xem đường nối ${r.a} trừ ${r.b}`}
          >
            {body}
          </button>
        );
      })}
      <svg className="mt-lines" viewBox="0 0 100 300" preserveAspectRatio="none" aria-hidden>
        {rows.map((r, i) =>
          shown(i) ? (
            <line
              key={i}
              className={r.done ? '' : 'revealed'}
              // x = 0 là cột hình (bên trái), x = 100 là cột phép tính (bên phải)
              x1={0}
              y1={MATCH_PICS.findIndex((p) => p.icon === r.icon) * 100 + 50}
              x2={100}
              y2={i * 100 + 50}
              vectorEffect="non-scaling-stroke"
            />
          ) : null,
        )}
      </svg>
      {MATCH_PICS.map((p, j) => (
        <div key={j} className="mt-pic" style={{ gridRow: j + 1 }}>
          <img src={p.src} alt={p.alt} />
          <span className="mt-dot" />
        </div>
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
      <div className="rp-box pop-in" role="dialog" aria-label="Bảng phép tính" style={{ '--gate-color': st.color } as CSSProperties}>
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
        ) : gate === 'bunny' && data.columns.some((c) => c.rows.length > 0) ? (
          <div className={`rp-cols cols-${data.columns.length}`}>
            {data.columns.map((c, i) => (
              <SheetColumn key={i} c={c} />
            ))}
          </div>
        ) : gate === 'pond' ? (
          <div className="rp-cols">
            <MatchLines rows={data.columns[0].rows} />
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
