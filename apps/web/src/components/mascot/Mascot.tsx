import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMascot, type MascotMood } from "../../stores/mascot.ts";
import { useUi, hintForPath } from "../../stores/ui.ts";

/** Professor Einstein 2D (SVG animado) — porta fiel do mascote legado v4.x */
export function EinsteinSVG({ mood }: { mood: MascotMood }) {
  return (
    <svg viewBox="0 0 120 124" className={`einstein ${mood}`} width="100%" height="100%">
      <g className="bob">
        <path d="M22 122 Q60 96 98 122 Z" fill="#f2f2f2" stroke="#1b1b1b" strokeWidth="2.5" />
        <path
          d="M52 108 L60 116 L68 108 L60 112 Z"
          fill="#d43a2f"
          stroke="#1b1b1b"
          strokeWidth="1.5"
        />
        <g fill="#ffffff" stroke="#1b1b1b" strokeWidth="2">
          <ellipse cx="28" cy="58" rx="15" ry="10" transform="rotate(-18 28 58)" />
          <ellipse cx="92" cy="58" rx="15" ry="10" transform="rotate(18 92 58)" />
          <ellipse cx="36" cy="40" rx="13" ry="9" transform="rotate(-32 36 40)" />
          <ellipse cx="84" cy="40" rx="13" ry="9" transform="rotate(32 84 40)" />
          <ellipse cx="60" cy="33" rx="14" ry="9" />
        </g>
        <ellipse
          cx="60"
          cy="66"
          rx="31"
          ry="33"
          fill="#f6d7b0"
          stroke="#1b1b1b"
          strokeWidth="2.5"
        />
        <g transform="rotate(-8 60 26)">
          <rect
            x="35"
            y="20"
            width="50"
            height="10"
            rx="2"
            fill="#20242c"
            stroke="#111"
            strokeWidth="1.5"
          />
          <path d="M39 20 L60 7 L81 20 Z" fill="#20242c" stroke="#111" strokeWidth="1.5" />
          <circle cx="60" cy="7" r="3.4" fill="#f5a623" stroke="#111" strokeWidth="1" />
          <path d="M81 23 Q90 30 87 40" stroke="#f5a623" strokeWidth="2.5" fill="none" />
          <circle cx="87" cy="41" r="2.4" fill="#f5a623" />
        </g>
        <g className="eyes">
          <circle cx="47" cy="62" r="8" fill="#fff" stroke="#1b1b1b" strokeWidth="1.8" />
          <circle cx="73" cy="62" r="8" fill="#fff" stroke="#1b1b1b" strokeWidth="1.8" />
          <circle className="pupil" cx="48" cy="63" r="3.4" fill="#1b1b1b" />
          <circle className="pupil" cx="74" cy="63" r="3.4" fill="#1b1b1b" />
          <rect className="lid" x="38" y="52" width="18" height="11" fill="#f6d7b0" rx="3" />
          <rect className="lid" x="64" y="52" width="18" height="11" fill="#f6d7b0" rx="3" />
        </g>
        <g className="cheerEyes" fill="none" stroke="#1b1b1b" strokeWidth="3" strokeLinecap="round">
          <path d="M40 62 Q47 55 54 62" />
          <path d="M66 62 Q73 55 80 62" />
        </g>
        <ellipse
          cx="60"
          cy="74"
          rx="7"
          ry="5.5"
          fill="#eec39a"
          stroke="#1b1b1b"
          strokeWidth="1.8"
        />
        <path
          d="M40 83 Q51 76 60 83 Q69 76 80 83 Q71 92 60 90 Q49 92 40 83 Z"
          fill="#e8e8e8"
          stroke="#1b1b1b"
          strokeWidth="1.8"
        />
        <ellipse
          className="mouth"
          cx="60"
          cy="96"
          rx="7.5"
          ry="3.6"
          fill="#7a3b2e"
          stroke="#1b1b1b"
          strokeWidth="1.8"
        />
      </g>
    </svg>
  );
}

export function Mascot() {
  const mood = useMascot((s) => s.mood);
  const bubble = useMascot((s) => s.bubble);
  const openChat = useUi((s) => s.openChat);
  const { pathname } = useLocation();
  const tip = hintForPath(pathname);

  // dica de boas-vindas por página (1ª visita à rota, sem falar por cima de outra bolha)
  useEffect(() => {
    const t = setTimeout(() => {
      if (!useMascot.getState().bubble) useMascot.getState().say(tip, "idle", 7000);
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      className="mascotWrap"
      onClick={openChat}
      title="Falar com o Professor Einstein"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") openChat();
      }}
    >
      {bubble ? (
        <div className={`mascotBubble${mood === "talk" ? " talking" : ""}`}>
          <span>{bubble}</span>
        </div>
      ) : null}
      <div className={`mascotCircle mood-${mood}`}>
        <EinsteinSVG mood={mood} />
        {mood === "think" ? (
          <div className="thinkDots">
            <i>.</i>
            <i>.</i>
            <i>.</i>
          </div>
        ) : null}
      </div>
    </div>
  );
}
