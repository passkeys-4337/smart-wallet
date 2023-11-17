import "./spinner.css";

type Props = {
  style?: React.CSSProperties;
  color?: string;
};

export default function Spinner({ style, color = "var(--accent-11)" }: Props) {
  return (
    <div className="spinner" style={{ width: "2rem", height: "2rem", ...style }}>
      <div className="double-bounce1" style={{ background: color }}></div>
      <div className="double-bounce2" style={{ background: color }}></div>
    </div>
  );
}
