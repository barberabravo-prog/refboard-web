import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = "https://rhgyovfcseyhrdlbojyq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZ3lvdmZjc2V5aHJkbGJvanlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NDAxNjAsImV4cCI6MjA4ODMxNjE2MH0.i9rXTqbzORkn7T3vhu8HVZ2kfaeoWZ3KJYAEuCG4ll4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
function getDomain(url){try{return new URL(url).hostname.replace("www.","");}catch{return url;}}

function NoteItem({note,onMouseDown,onTouchStart,onDelete,onUpdate}){
  const [editing,setEditing]=useState(false);
  const [text,setText]=useState(note.caption||"");
  const [resizing,setResizing]=useState(false);
  const resizeStart=useRef(null);
  const handleResizeMouseDown=(e)=>{
    e.stopPropagation();
    setResizing(true);
    resizeStart.current={x:e.clientX,y:e.clientY,w:note.width||200,h:note.height||150};
  };
  const handleResizeMouseMove=useCallback((e)=>{
    if(!resizing||!resizeStart.current)return;
    const w=Math.max(150,resizeStart.current.w+(e.clientX-resizeStart.current.x));
    const h=Math.max(100,resizeStart.current.h+(e.clientY-resizeStart.current.y));
    onUpdate(note.id,{width:w,height:h});
  },[resizing,note.id,onUpdate]);
  const handleResizeMouseUp=useCallback(()=>setResizing(false),[]);
  useEffect(()=>{
    if(resizing){
      window.addEventListener("mousemove",handleResizeMouseMove);
      window.addEventListener("mouseup",handleResizeMouseUp);
    }
    return()=>{window.removeEventListener("mousemove",handleResizeMouseMove);window.removeEventListener("mouseup",handleResizeMouseUp);};
  },[resizing,handleResizeMouseMove,handleResizeMouseUp]);
  return(
    <div onMouseDown={(e)=>{if(!editing)onMouseDown(e,note);}} onTouchStart={(e)=>{if(!editing)onTouchStart(e,note);}}
      style={{position:"absolute",left:note.x,top:note.y,width:note.width||200,height:note.height||150,background:"#FFD9A0",border:"1px solid #FFC266",borderRadius:10,padding:10,cursor:editing?"default":"grab",userSelect:"none",boxShadow:"0 2px 12px rgba(0,0,0,0.1)",display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:10,color:"#B8860B",fontWeight:600,letterSpacing:"0.05em"}}>NOTA</span>
        <button onMouseDown={e=>{e.stopPropagation();onDelete(note.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"#B8860B",fontSize:14,lineHeight:1,padding:0}}>×</button>
      </div>
      {editing?(
        <textarea autoFocus value={text}
          onChange={e=>setText(e.target.value)}
          onBlur={()=>{setEditing(false);onUpdate(note.id,{caption:text});}}
          style={{flex:1,background:"transparent",border:"none",outline:"none",resize:"none",fontSize:13,color:"#5C3D00",fontFamily:"inherit",lineHeight:1.5}}/>
      ):(
        <div onDoubleClick={()=>setEditing(true)}
          style={{flex:1,fontSize:13,color:text?"#5C3D00":"#C8A060",lineHeight:1.5,overflow:"hidden",cursor:"text"}}>
          {text||"Doble click para escribir..."}
        </div>
      )}
      <div onMouseDown={e=>{e.stopPropagation();handleResizeMouseDown(e);}}
        style={{position:"absolute",bottom:4,right:4,width:14,height:14,cursor:"se-resize",opacity:0.4}}>
        <svg viewBox="0 0 10 10" style={{width:"100%",height:"100%"}}><path d="M2,10 L10,2 M6,10 L10,6" stroke="#B8860B" strokeWidth="1.5"/></svg>
      </div>
    </div>
  );
}

function CardItem({card,onMouseDown,onTouchStart,onDelete,onOpen}){
  const [imgError,setImgError]=useState(false);
  return(
    <div onMouseDown={(e)=>onMouseDown(e,card)} onTouchStart={(e)=>onTouchStart(e,card)}
      style={{position:"absolute",left:card.x,top:card.y,width:210,background:"#fff",border:"1px solid #e8e8e8",borderRadius:10,overflow:"hidden",cursor:"grab",userSelect:"none",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",transition:"box-shadow 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,0.14)"}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.08)"}>
      <div style={{width:"100%",height:120,background:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
        {card.image&&!imgError?(
          <img src={card.image} alt="" onError={()=>setImgError(true)} style={{width:"100%",height:"100%",objectFit:"cover"}} draggable={false}/>
        ):(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <img src={"https://www.google.com/s2/favicons?domain="+card.domain+"&sz=64"} alt="" style={{width:28,height:28,opacity:0.4}} draggable={false}/>
            <span style={{color:"#bbb",fontSize:10}}>{card.domain}</span>
          </div>
        )}
        <button onMouseDown={e=>{e.stopPropagation();onDelete(card.id);}} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.4)",border:"none",borderRadius:4,color:"#fff",cursor:"pointer",fontSize:12,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>×</button>
      </div>
      <div style={{padding:"10px 12px 12px"}}>
        <p style={{margin:"0 0 4px",fontSize:12,fontWeight:600,color:"#111",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{card.title||card.domain}</p>
        {card.caption&&<p style={{margin:"0 0 8px",fontSize:11,color:"#666",fontStyle:"italic",lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>"{card.caption}"</p>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:10,color:"#aaa"}}>{card.domain}</span>
          <button onMouseDown={e=>e.stopPropagation()} onClick={()=>onOpen(card.url)} style={{background:"#111",border:"none",borderRadius:5,color:"#fff",fontSize:10,fontWeight:600,padding:"4px 8px",cursor:"pointer"}}>Abrir</button>
        </div>
      </div>
    </div>
  );
}

export default function RefBoard(){
  const [cards,setCards]=useState([]);
  const [notes,setNotes]=useState([]);
  const [offset,setOffset]=useState({x:0,y:0});
  const [scale,setScale]=useState(1);
  const [inputUrl,setInputUrl]=useState("");
  const [loading,setLoading]=useState(false);
  const [status,setStatus]=useState("");
  const [draggingId,setDraggingId]=useState(null);
  const [draggingType,setDraggingType]=useState(null);
  const [isPanning,setIsPanning]=useState(false);
  const [lastSync,setLastSync]=useState(null);
  const canvasRef=useRef(null);
  const panStart=useRef(null);
  const dragStart=useRef(null);
  const cardsRef=useRef(cards);
  const notesRef=useRef(notes);
  cardsRef.current=cards;
  notesRef.current=notes;

  useEffect(()=>{
    const load=async()=>{
      const{data}=await supabase.from("cards").select("*").eq("board_id","default").order("created_at",{ascending:true});
      if(data){
        setCards(data.filter(d=>d.url&&!d.title?.startsWith("__note__")));
        setNotes(data.filter(d=>d.title?.startsWith("__note__")));
        setLastSync(new Date());
      }
    };
    load();
    const channel=supabase.channel("cards-changes").on("postgres_changes",{event:"*",schema:"public",table:"cards"},load).subscribe();
    return()=>supabase.removeChannel(channel);
  },[]);

  const addCard=async()=>{
    if(!inputUrl.trim())return;
    let url=inputUrl.trim();
    if(!url.startsWith("http"))url="https://"+url;
    setLoading(true);setStatus("cargando...");
    const domain=getDomain(url);
    let meta={title:domain,description:"",image:null};
    try{
      const res=await fetch("https://api.microlink.io?url="+encodeURIComponent(url)+"&screenshot=false");
      const data=await res.json();
      if(data?.data?.title)meta.title=data.data.title;
      if(data?.data?.description)meta.description=data.data.description;
      if(data?.data?.image?.url)meta.image=data.data.image.url;
    }catch{}
    const card={id:Date.now()+"_"+Math.random().toString(36).slice(2),board_id:"default",url,title:meta.title,description:meta.description,image:meta.image,domain,caption:"",x:-offset.x/scale+100+Math.random()*300,y:-offset.y/scale+100+Math.random()*200};
    await supabase.from("cards").insert(card);
    setInputUrl("");setLoading(false);setStatus("guardado");
    setTimeout(()=>setStatus(""),2000);
  };

  const addNote=async()=>{
    const note={id:Date.now()+"_note_"+Math.random().toString(36).slice(2),board_id:"default",url:"about:blank",title:"__note__",description:"",image:null,domain:"note",caption:"",width:200,height:150,x:-offset.x/scale+100+Math.random()*200,y:-offset.y/scale+100+Math.random()*150};
    setNotes(prev=>[...prev,note]);
    await supabase.from("cards").insert(note);
  };

  const deleteCard=async(id)=>{setCards(prev=>prev.filter(c=>c.id!==id));await supabase.from("cards").delete().eq("id",id);};
  const deleteNote=async(id)=>{setNotes(prev=>prev.filter(n=>n.id!==id));await supabase.from("cards").delete().eq("id",id);};
  const updateNote=async(id,fields)=>{
    setNotes(prev=>prev.map(n=>n.id===id?{...n,...fields}:n));
    await supabase.from("cards").update(fields).eq("id",id);
  };

  // Pointer events unificados para mouse y touch
  const getPoint=(e)=>{
    if(e.touches)return{x:e.touches[0].clientX,y:e.touches[0].clientY};
    return{x:e.clientX,y:e.clientY};
  };

  const startPan=(e)=>{
    const p=getPoint(e);
    setIsPanning(true);
    panStart.current={x:p.x-offset.x,y:p.y-offset.y};
  };

  const startDrag=(e,item,type)=>{
    if(e.touches)e.preventDefault();
    const p=getPoint(e);
    setDraggingId(item.id);
    setDraggingType(type);
    dragStart.current={mouseX:p.x,mouseY:p.y,itemX:item.x,itemY:item.y};
  };

  const handleMove=(e)=>{
    const p=getPoint(e);
    if(isPanning&&panStart.current){
      setOffset({x:p.x-panStart.current.x,y:p.y-panStart.current.y});
    }
    if(draggingId&&dragStart.current){
      const dx=(p.x-dragStart.current.mouseX)/scale;
      const dy=(p.y-dragStart.current.mouseY)/scale;
      const nx=dragStart.current.itemX+dx;
      const ny=dragStart.current.itemY+dy;
      if(draggingType==="card")setCards(prev=>prev.map(c=>c.id===draggingId?{...c,x:nx,y:ny}:c));
      if(draggingType==="note")setNotes(prev=>prev.map(n=>n.id===draggingId?{...n,x:nx,y:ny}:n));
    }
  };

  const handleUp=async()=>{
    if(draggingId){
      if(draggingType==="card"){const c=cardsRef.current.find(c=>c.id===draggingId);if(c)await supabase.from("cards").update({x:c.x,y:c.y}).eq("id",c.id);}
      if(draggingType==="note"){const n=notesRef.current.find(n=>n.id===draggingId);if(n)await supabase.from("cards").update({x:n.x,y:n.y}).eq("id",n.id);}
    }
    setIsPanning(false);setDraggingId(null);setDraggingType(null);
    panStart.current=null;dragStart.current=null;
  };

  // Pinch zoom móvil
  const lastPinch=useRef(null);
  const handleTouchMove=(e)=>{
    if(e.touches.length===2){
      e.preventDefault();
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      if(lastPinch.current){const factor=d/lastPinch.current;setScale(s=>Math.min(Math.max(s*factor,0.15),4));}
      lastPinch.current=d;
    } else {
      lastPinch.current=null;
      handleMove(e);
    }
  };
  const handleTouchEnd=()=>{lastPinch.current=null;handleUp();};

  const handleWheel=useCallback((e)=>{
    e.preventDefault();
    setScale(s=>Math.min(Math.max(s*(e.deltaY>0?0.92:1.08),0.15),4));
  },[]);
  useEffect(()=>{
    const el=canvasRef.current;
    if(!el)return;
    el.addEventListener("wheel",handleWheel,{passive:false});
    return()=>el.removeEventListener("wheel",handleWheel);
  },[handleWheel]);

  const handleCanvasDown=(e)=>{
    if(e.target.closest("[data-item]"))return;
    startPan(e);
  };
  const handleCanvasTouch=(e)=>{
    if(e.target.closest("[data-item]"))return;
    if(e.touches.length===1)startPan(e);
  };

  const zBtn={background:"#fff",border:"1px solid #e0e0e0",borderRadius:6,color:"#666",fontSize:16,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"};

  return(
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{overflow:hidden;touch-action:none;}input,textarea{touch-action:auto;}input::placeholder{color:#bbb;}`}</style>
      <div ref={canvasRef}
        onMouseDown={handleCanvasDown} onMouseMove={handleMove} onMouseUp={handleUp} onMouseLeave={handleUp}
        onTouchStart={handleCanvasTouch} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        style={{width:"100vw",height:"100vh",background:"#f0f0f0",backgroundImage:"radial-gradient(circle, #d0d0d0 1px, transparent 1px)",backgroundSize:"24px 24px",overflow:"hidden",cursor:isPanning?"grabbing":"default",position:"relative",fontFamily:"system-ui,-apple-system,sans-serif"}}>

        {/* Header */}
        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",background:"rgba(240,240,240,0.92)",backdropFilter:"blur(8px)",borderBottom:"1px solid #e0e0e0"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e"}}/>
            <span style={{fontWeight:700,fontSize:14,color:"#111"}}>RefBoard</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {lastSync&&<span style={{fontSize:10,color:"#bbb",display:"none"}}>sync {lastSync.toLocaleTimeString("es")}</span>}
            <span style={{fontSize:11,color:"#999"}}>{cards.length} refs</span>
            <button onClick={addNote} style={{background:"#FFD9A0",border:"1px solid #FFC266",borderRadius:6,color:"#8B5E00",fontSize:11,fontWeight:600,padding:"5px 10px",cursor:"pointer"}}>+ Nota</button>
            <button onClick={()=>{setOffset({x:0,y:0});setScale(1);}} style={{background:"transparent",border:"1px solid #ddd",borderRadius:6,color:"#888",fontSize:11,padding:"5px 10px",cursor:"pointer"}}>Reset</button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{transform:"translate("+offset.x+"px,"+offset.y+"px) scale("+scale+")",transformOrigin:"0 0",position:"absolute",top:0,left:0,width:0,height:0}}>
          {notes.map(note=>(
            <div key={note.id} data-item="true">
              <NoteItem note={note} onMouseDown={(e,n)=>startDrag(e,n,"note")} onTouchStart={(e,n)=>startDrag(e,n,"note")} onDelete={deleteNote} onUpdate={updateNote}/>
            </div>
          ))}
          {cards.map(card=>(
            <div key={card.id} data-item="true">
              <CardItem card={card} onMouseDown={(e,c)=>startDrag(e,c,"card")} onTouchStart={(e,c)=>startDrag(e,c,"card")} onDelete={deleteCard} onOpen={(url)=>window.open(url,"_blank")}/>
            </div>
          ))}
        </div>

        {cards.length===0&&notes.length===0&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{border:"1.5px dashed #d0d0d0",borderRadius:16,padding:"40px 60px",textAlign:"center",background:"rgba(255,255,255,0.5)"}}>
              <p style={{fontWeight:700,fontSize:18,color:"#ccc",marginBottom:8}}>Canvas vacío</p>
              <p style={{fontSize:12,color:"#ccc"}}>Pega un link abajo o envía uno al bot de Telegram</p>
            </div>
          </div>
        )}

        {/* Zoom */}
        <div style={{position:"fixed",bottom:80,left:16,zIndex:100,display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={()=>setScale(s=>Math.max(s*0.85,0.15))} style={zBtn}>−</button>
          <span style={{fontSize:10,color:"#aaa",minWidth:36,textAlign:"center"}}>{Math.round(scale*100)}%</span>
          <button onClick={()=>setScale(s=>Math.min(s*1.15,4))} style={zBtn}>+</button>
        </div>

        {/* Input */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,padding:"10px 16px 14px",background:"rgba(240,240,240,0.95)",backdropFilter:"blur(8px)",borderTop:"1px solid #e0e0e0",display:"flex",gap:8,alignItems:"center"}}>
          <input value={inputUrl} onChange={e=>setInputUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!loading&&addCard()}
            placeholder="Pega un link de Instagram, TikTok, Pinterest..."
            style={{flex:1,background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,color:"#111",fontSize:13,padding:"10px 14px",outline:"none",fontFamily:"inherit"}}
            onFocus={e=>e.target.style.borderColor="#111"} onBlur={e=>e.target.style.borderColor="#e0e0e0"}/>
          <button onClick={addCard} disabled={loading||!inputUrl.trim()}
            style={{background:"#111",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:600,padding:"10px 18px",cursor:loading?"not-allowed":"pointer",opacity:(!inputUrl.trim()&&!loading)?0.3:1,whiteSpace:"nowrap",fontFamily:"inherit"}}>
            {loading?"...":status||"Añadir"}
          </button>
        </div>
      </div>
    </>
  );
}
