import './campus-lighting.css';

export default function CampusLighting({ moving }) {
  return (
    <div className={`campus-lighting${moving ? ' lighting-moving' : ''}`} aria-hidden="true">
      <div className="portal-light portal-light-start" />
      <div className="portal-light portal-light-finish" />
      <div className="portal-ground-reflection portal-ground-reflection-start" />
      <div className="portal-ground-reflection portal-ground-reflection-finish" />
      <div className="stone-bounce" />
      <div className="leaf-transmission" />
      <div className="chest-bounce" />
      <div className="water-glints water-glints-courtyard" />
      <div className="water-glints water-glints-upper" />
      <div className="water-glints water-glints-lower" />
      <div className="fountain-ripples" />
    </div>
  );
}
