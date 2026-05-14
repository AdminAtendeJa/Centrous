import { X } from 'lucide-react';
export default function ModalV3({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;
  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)',backdropFilter:'blur(4px)'}} onClick={onClose}>
      <div className='modal-v3-content' onClick={e=>e.stopPropagation()} style={{background:'white',borderRadius:16,width:'min(560px,95vw)',maxHeight:'85vh',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,0.18)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:'0.5px solid rgba(0,0,0,0.07)',flexShrink:0}}>
          <span style={{fontSize:15,fontWeight:700,color:'var(--txt-0,#0f172a)'}}>{title}</span>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--txt-2,#64748b)'}}><X size={16}/></button>
        </div>
        <div style={{padding:'20px 24px',overflowY:'auto',flex:1}}>{children}</div>
        {footer && <div style={{padding:'16px 24px',borderTop:'0.5px solid rgba(0,0,0,0.07)',display:'flex',gap:8,justifyContent:'flex-end',flexShrink:0}}>{footer}</div>}
      </div>
    </div>
  );
}