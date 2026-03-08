import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = "https://rhgyovfcseyhrdlbojyq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZ3lvdmZjc2V5aHJkbGJvanlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NDAxNjAsImV4cCI6MjA4ODMxNjE2MH0.i9rXTqbzORkn7T3vhu8HVZ2kfaeoWZ3KJYAEuCG4ll4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
function getDomain(url){try{return new URL(url).hostname.replace("www.","");}catch{return url;}}

function findFreePosition(existing,w=230,h=210){
  for(let row=0;row<30;row++){
    for(let col=0;col<30;col++){
      const x=40+col*(w+24),y=60+row*(h+24);
      const hit=existing.some(it=>x<(it.x||0)+w+20&&x+w+20>(it.x||0)&&y<(it.y||0)+h+20&&y+h+20>(it.y||0));
      if(!hit)return{x,y};
    }
  }
  return{x:40+Math.random()*400,y:60+Math.random()*300};
}

function gridLayout(items,w=230,h=210,pad=24){
  const cols=Math.max(1,Math.round(Math.sqrt(items.length)*1.4));
  return items.map((it,i)=>({...it,x:40+(i%cols)*(w+pad),y:60+Math.floor(i/cols)*(h+pad)}));
}

function SelectCircle({selected,onToggle}){
  return(
    <div onPointerDown={e=>{e.stopPropagation();onToggle();}}
      style={{position:"absolute",top:8,left:8,zIndex:10,width:22,height:22,borderRadius:"50%",
        background:selected?"#007AFF":"rgba(255,255,255,0.9)",
        border:selected?"2px solid #007AFF":"2px solid #ccc",
        display:"flex",alignItems:"center",justifyContent:"center",
        cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.2)",flexShrink:0}}>
      {selected&&<svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
    </div>
  );
}

function NoteItem({note,onPointerDown,onDelete,onUpdate,selected,onToggleSelect}){
  const [editing,setEditing]=useState(false);
  const [text,setText]=useState(note.caption||"");
  useEffect(()=>setText(note.caption||""),[note.caption]);
  const handleResizeDown=(e)=>{
    e.stopPropagation();e.preventDefault();
    const sx=e.clientX,sy=e.clientY,sw=note.width||200,sh=note.height||150;
    const onMove=(ev)=>onUpdate(note.id,{width:Math.max(150,sw+(ev.clientX-sx)),height:Math.max(80,sh+(ev.clientY-sy))});
    const onUp=()=>{window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseup",onUp);};
    window.addEventListener("mousemove",onMove);window.addEventListener("mouseup",onUp);
  };
  return(
    <div onPointerDown={(e)=>{if(!editing)onPointerDown(e,note);}}
      style={{position:"absolute",left:note.x,top:note.y,width:note.width||200,height:note.height||150,
        background:"#FFE4B5",border:selected?"2px solid #007AFF":"1.5px solid #FFC266",
        borderRadius:10,padding:"8px 10px 8px 36px",cursor:editing?"default":"grab",userSelect:"none",
        boxShadow:selected?"0 0 0 3px rgba(0,122,255,0.15),0 2px 8px rgba(0,0,0,0.1)":"0 2px 8px rgba(0,0,0,0.1)",
        display:"flex",flexDirection:"column",gap:4,touchAction:"none",position:"absolute"}}>
      <SelectCircle selected={selected} onToggle={onToggleSelect}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:9,color:"#A0522D",fontWeight:700,letterSpacing:"0.08em"}}>NOTA</span>
        <button onPointerDown={e=>{e.stopPropagation();onDelete(note.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"#A0522D",fontSize:16,lineHeight:1,padding:0}}>×</button>
      </div>
      {editing?(
        <textarea autoFocus value={text} onChange={e=>setText(e.target.value)}
          onBlur={()=>{setEditing(false);onUpdate(note.id,{caption:text});}}
          style={{flex:1,background:"transparent",border:"none",outline:"none",resize:"none",fontSize:13,color:"#5C3D00",fontFamily:"inherit",lineHeight:1.5,touchAction:"auto"}}/>
      ):(
        <div onDoubleClick={e=>{e.stopPropagation();setEditing(true);}}
          style={{flex:1,fontSize:13,color:text?"#5C3D00":"#C8A060",lineHeight:1.5,overflow:"hidden",cursor:"text"}}>
          {text||"Doble click para escribir..."}
        </div>
      )}
      <div onMouseDown={handleResizeDown} style={{position:"absolute",bottom:3,right:3,width:16,height:16,cursor:"se-resize",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg viewBox="0 0 10 10" width="10" height="10"><path d="M2,10 L10,2 M5,10 L10,5 M8,10 L10,8" stroke="#A0522D" strokeWidth="1.5"/></svg>
      </div>
    </div>
  );
}

function CardItem({card,onPointerDown,onDelete,onOpen,selected,onToggleSelect}){
  const [imgError,setImgError]=useState(false);
  return(
    <div onPointerDown={(e)=>onPointerDown(e,card)}
      style={{position:"absolute",left:card.x,top:card.y,width:230,background:"#fff",
        border:selected?"2px solid #007AFF":"1px solid #e8e8e8",
        borderRadius:10,overflow:"visible",cursor:"grab",userSelect:"none",
        boxShadow:selected?"0 0 0 3px rgba(0,122,255,0.15),0 2px 12px rgba(0,0,0,0.08)":"0 2px 12px rgba(0,0,0,0.08)",
        touchAction:"none"}}>
      <SelectCircle selected={selected} onToggle={onToggleSelect}/>
      <div style={{width:"100%",height:130,background:"#f5f5f5",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",borderRadius:"10px 10px 0 0",position:"relative"}}>
        {card.image&&!imgError?(
          <img src={card.image} alt="" onError={()=>setImgError(true)} style={{width:"100%",height:"100%",objectFit:"cover"}} draggable={false}/>
        ):(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <img src={"https://www.google.com/s2/favicons?domain="+card.domain+"&sz=64"} alt="" style={{width:28,height:28,opacity:0.4}} draggable={false}/>
            <span style={{color:"#bbb",fontSize:10}}>{card.domain}</span>
          </div>
        )}
        <button onPointerDown={e=>{e.stopPropagation();onDelete(card.id);}} style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.4)",border:"none",borderRadius:4,color:"#fff",cursor:"pointer",fontSize:12,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>x</button>
      </div>
      <div style={{padding:"10px 12px 12px"}}>
        <p style={{margin:"0 0 4px",fontSize:12,fontWeight:600,color:"#111",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{card.title||card.domain}</p>
        {card.caption&&<p style={{margin:"0 0 8px",fontSize:11,color:"#666",fontStyle:"italic",lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>"{card.caption}"</p>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:10,color:"#aaa"}}>{card.domain}</span>
          <button onPointerDown={e=>e.stopPropagation()} onClick={()=>onOpen(card.url)} style={{background:"#111",border:"none",borderRadius:5,color:"#fff",fontSize:10,fontWeight:600,padding:"4px 8px",cursor:"pointer"}}>Abrir</button>
        </div>
      </div>
    </div>
  );
}

export default function RefBoard(){
  const [cards,setCards]=useState([]);
  const [notes,setNotes]=useState([]);
  const [selected,setSelected]=useState(new Set());
  const [offset,setOffset]=useState({x:0,y:0});
  const [scale,setScale]=useState(1);
  const [inputUrl,setInputUrl]=useState("");
  const [loading,setLoading]=useState(false);
  const [status,setStatus]=useState("");
  const [cleaning,setCleaning]=useState(false);
  const [draggingId,setDraggingId]=useState(null);
  const [draggingType,setDraggingType]=useState(null);
  const [isPanning,setIsPanning]=useState(false);
  const canvasRef=useRef(null);
  const panStart=useRef(null);
  const dragStart=useRef(null);
  const cardsRef=useRef(cards);
  const notesRef=useRef(notes);
  const selectedRef=useRef(selected);
  const pinchRef=useRef(null);
  const activePointers=useRef({});
  cardsRef.current=cards;
  notesRef.current=notes;
  selectedRef.current=selected;

  const load=useCallback(async()=>{
    const{data}=await supabase.from("cards").select("*").eq("board_id","default").order("created_at",{ascending:true});
    if(data){setCards(data.filter(d=>d.domain!=="note"));setNotes(data.filter(d=>d.domain==="note"));}
  },[]);

  useEffect(()=>{
    load();
    const ch=supabase.channel("cards-changes").on("postgres_changes",{event:"*",schema:"public",table:"cards"},load).subscribe();
    return()=>supabase.removeChannel(ch);
  },[load]);

  const toggleSelect=(id)=>{
    setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  };

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
    const pos=findFreePosition([...cardsRef.current,...notesRef.current]);
    const card={id:Date.now()+"_"+Math.random().toString(36).slice(2),board_id:"default",url,title:meta.title,description:meta.description,image:meta.image,domain,caption:"",...pos};
    await supabase.from("cards").insert(card);
    setInputUrl("");setLoading(false);setStatus("guardado");
    setTimeout(()=>setStatus(""),2000);
  };

  const addNote=async()=>{
    const pos=findFreePosition([...cardsRef.current,...notesRef.current],200,150);
    const note={id:Date.now()+"_note_"+Math.random().toString(36).slice(2),board_id:"default",url:"about:blank",title:"",description:"",image:null,domain:"note",caption:"",width:200,height:150,...pos};
    setNotes(prev=>[...prev,note]);
    await supabase.from("cards").insert(note);
  };

  const deleteCard=async(id)=>{setCards(prev=>prev.filter(c=>c.id!==id));await supabase.from("cards").delete().eq("id",id);};
  const deleteNote=async(id)=>{setNotes(prev=>prev.filter(n=>n.id!==id));await supabase.from("cards").delete().eq("id",id);};
  const updateNote=async(id,fields)=>{setNotes(prev=>prev.map(n=>n.id===id?{...n,...fields}:n));await supabase.from("cards").update(fields).eq("id",id);};

  const deleteSelected=async()=>{
    const ids=[...selectedRef.current];
    for(const id of ids)await supabase.from("cards").delete().eq("id",id);
    setCards(prev=>prev.filter(c=>!ids.includes(c.id)));
    setNotes(prev=>prev.filter(n=>!ids.includes(n.id)));
    setSelected(new Set());
  };

  const gridSelected=async()=>{
    const ids=[...selectedRef.current];
    const selCards=cardsRef.current.filter(c=>ids.includes(c.id));
    const selNotes=notesRef.current.filter(n=>ids.includes(n.id));
    const all=[...selCards,...selNotes];
    const arranged=gridLayout(all);
    setCards(prev=>prev.map(c=>{const a=arranged.find(a=>a.id===c.id);return a?{...c,...a}:c;}));
    setNotes(prev=>prev.map(n=>{const a=arranged.find(a=>a.id===n.id);return a?{...n,...a}:n;}));
    for(const a of arranged)await supabase.from("cards").update({x:a.x,y:a.y}).eq("id",a.id);
    setOffset({x:0,y:0});setScale(0.7);
  };

  const gridAll=async()=>{
    const arranged=gridLayout(cardsRef.current);
    setCards(arranged);
    for(const c of arranged)await supabase.from("cards").update({x:c.x,y:c.y}).eq("id",c.id);
    setOffset({x:0,y:0});setScale(0.7);
  };

  const cleanBroken=async()=>{
    setCleaning(true);setStatus("comprobando links...");
    const broken=[];
    await Promise.all(cardsRef.current.map(async(c)=>{
      try{const r=await fetch("https://api.microlink.io?url="+encodeURIComponent(c.url));const d=await r.json();if(d?.status==="fail"||!d?.data)broken.push(c.id);}
      catch{broken.push(c.id);}
    }));
    for(const id of broken)await supabase.from("cards").delete().eq("id",id);
    setCards(prev=>prev.filter(c=>!broken.includes(c.id)));
    setCleaning(false);setStatus(broken.length>0?broken.length+" borrados":"Todo OK");
    setTimeout(()=>setStatus(""),3000);
  };

  // Drag — si hay seleccionados y el item es uno de ellos, mueve todos
  const handlePointerDownCanvas=(e)=>{
    if(e.target.closest("[data-item]"))return;
    setSelected(new Set());
    activePointers.current[e.pointerId]={x:e.clientX,y:e.clientY};
    if(Object.keys(activePointers.current).length===1){
      setIsPanning(true);
      panStart.current={x:e.clientX-offset.x,y:e.clientY-offset.y};
    }
    try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}
  };

  const startDrag=(e,item,type)=>{
    e.stopPropagation();
    activePointers.current[e.pointerId]={x:e.clientX,y:e.clientY};
    setDraggingId(item.id);setDraggingType(type);
    // Snapshot posiciones iniciales de todos los seleccionados
    const ids=selectedRef.current.has(item.id)?[...selectedRef.current]:[item.id];
    const snapCards=cardsRef.current.filter(c=>ids.includes(c.id)).map(c=>({id:c.id,x:c.x,y:c.y,type:"card"}));
    const snapNotes=notesRef.current.filter(n=>ids.includes(n.id)).map(n=>({id:n.id,x:n.x,y:n.y,type:"note"}));
    dragStart.current={mouseX:e.clientX,mouseY:e.clientY,snaps:[...snapCards,...snapNotes],single:{id:item.id,x:item.x,y:item.y,type}};
    try{canvasRef.current?.setPointerCapture(e.pointerId);}catch{}
  };

  const handlePointerMove=(e)=>{
    activePointers.current[e.pointerId]={x:e.clientX,y:e.clientY};
    const pts=Object.values(activePointers.current);
    if(pts.length>=2){
      const d=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);
      if(pinchRef.current){const f=d/pinchRef.current;setScale(s=>Math.min(Math.max(s*f,0.1),5));}
      pinchRef.current=d;return;
    }
    pinchRef.current=null;
    if(isPanning&&panStart.current)setOffset({x:e.clientX-panStart.current.x,y:e.clientY-panStart.current.y});
    if(draggingId&&dragStart.current){
      const dx=(e.clientX-dragStart.current.mouseX)/scale;
      const dy=(e.clientY-dragStart.current.mouseY)/scale;
      const snaps=dragStart.current.snaps;
      if(snaps.length>1){
        // Mover todos los seleccionados
        const cardUpdates={};const noteUpdates={};
        snaps.forEach(s=>{
          if(s.type==="card")cardUpdates[s.id]={x:s.x+dx,y:s.y+dy};
          else noteUpdates[s.id]={x:s.x+dx,y:s.y+dy};
        });
        setCards(prev=>prev.map(c=>cardUpdates[c.id]?{...c,...cardUpdates[c.id]}:c));
        setNotes(prev=>prev.map(n=>noteUpdates[n.id]?{...n,...noteUpdates[n.id]}:n));
      } else {
        const s=dragStart.current.single;
        const nx=s.x+dx,ny=s.y+dy;
        if(s.type==="card")setCards(prev=>prev.map(c=>c.id===draggingId?{...c,x:nx,y:ny}:c));
        if(s.type==="note")setNotes(prev=>prev.map(n=>n.id===draggingId?{...n,x:nx,y:ny}:n));
      }
    }
  };

  const handlePointerUp=async(e)=>{
    delete activePointers.current[e.pointerId];
    if(Object.keys(activePointers.current).length<2)pinchRef.current=null;
    if(draggingId&&dragStart.current){
      const snaps=dragStart.current.snaps;
      if(snaps.length>1){
        for(const s of snaps){
          const item=s.type==="card"?cardsRef.current.find(c=>c.id===s.id):notesRef.current.find(n=>n.id===s.id);
          if(item)await supabase.from("cards").update({x:item.x,y:item.y}).eq("id",item.id);
        }
      } else {
        const s=dragStart.current.single;
        const item=s.type==="card"?cardsRef.current.find(c=>c.id===s.id):notesRef.current.find(n=>n.id===s.id);
        if(item)await supabase.from("cards").update({x:item.x,y:item.y}).eq("id",item.id);
      }
    }
    setIsPanning(false);setDraggingId(null);setDraggingType(null);
    panStart.current=null;dragStart.current=null;
  };

  const handleWheel=useCallback((e)=>{
    e.preventDefault();setScale(s=>Math.min(Math.max(s*(e.deltaY>0?0.92:1.08),0.1),5));
  },[]);
  useEffect(()=>{
    const el=canvasRef.current;if(!el)return;
    el.addEventListener("wheel",handleWheel,{passive:false});
    return()=>el.removeEventListener("wheel",handleWheel);
  },[handleWheel]);

  const zBtn={background:"#fff",border:"1px solid #e0e0e0",borderRadius:6,color:"#666",fontSize:18,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"};
  const selCount=selected.size;

  return(
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{overflow:hidden;touch-action:none;}input,textarea{touch-action:auto;}input::placeholder{color:#bbb;}`}</style>
      <div ref={canvasRef}
        onPointerDown={handlePointerDownCanvas} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
        style={{width:"100vw",height:"100vh",background:"#f0f0f0",backgroundImage:"radial-gradient(circle,#d0d0d0 1px,transparent 1px)",backgroundSize:"24px 24px",overflow:"hidden",cursor:isPanning?"grabbing":"default",position:"relative",fontFamily:"system-ui,-apple-system,sans-serif"}}>

        <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",background:"rgba(240,240,240,0.95)",backdropFilter:"blur(8px)",borderBottom:"1px solid #e0e0e0"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e"}}/>
            <span style={{fontWeight:700,fontSize:14,color:"#111"}}>RefBoard</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <span style={{fontSize:11,color:"#999"}}>{cards.length} refs</span>
            <button onClick={addNote} style={{background:"#FFE4B5",border:"1px solid #FFC266",borderRadius:6,color:"#8B5E00",fontSize:11,fontWeight:600,padding:"6px 10px",cursor:"pointer"}}>+ Nota</button>
            <button onClick={gridAll} style={{background:"#fff",border:"1px solid #ddd",borderRadius:6,color:"#555",fontSize:11,fontWeight:600,padding:"6px 10px",cursor:"pointer"}}>⊞ Grid</button>
            <button onClick={cleanBroken} disabled={cleaning} style={{background:"#fff",border:"1px solid #ddd",borderRadius:6,color:"#888",fontSize:11,padding:"6px 10px",cursor:"pointer"}}>{cleaning?"...":"🔗 Limpiar"}</button>
            <button onClick={()=>{setOffset({x:0,y:0});setScale(1);}} style={{background:"transparent",border:"1px solid #ddd",borderRadius:6,color:"#888",fontSize:11,padding:"6px 10px",cursor:"pointer"}}>Reset</button>
          </div>
        </div>

        {selCount>0&&(
          <div style={{position:"fixed",top:52,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"#111",borderRadius:10,padding:"8px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 20px rgba(0,0,0,0.3)",whiteSpace:"nowrap"}}>
            <span style={{color:"#fff",fontSize:12,fontWeight:600}}>{selCount} seleccionado{selCount>1?"s":""}</span>
            <button onClick={gridSelected} style={{background:"#333",border:"none",borderRadius:6,color:"#fff",fontSize:11,padding:"5px 10px",cursor:"pointer"}}>⊞ Grid</button>
            <button onClick={deleteSelected} style={{background:"#e53e3e",border:"none",borderRadius:6,color:"#fff",fontSize:11,fontWeight:600,padding:"5px 10px",cursor:"pointer"}}>Borrar</button>
            <button onClick={()=>setSelected(new Set())} style={{background:"transparent",border:"none",color:"#888",fontSize:18,cursor:"pointer",lineHeight:1,padding:0}}>×</button>
          </div>
        )}

        <div style={{transform:"translate("+offset.x+"px,"+offset.y+"px) scale("+scale+")",transformOrigin:"0 0",position:"absolute",top:0,left:0,width:0,height:0}}>
          {notes.map(note=>(
            <div key={note.id} data-item="true">
              <NoteItem note={note} onPointerDown={(e,n)=>startDrag(e,n,"note")} onDelete={deleteNote} onUpdate={updateNote} selected={selected.has(note.id)} onToggleSelect={()=>toggleSelect(note.id)}/>
            </div>
          ))}
          {cards.map(card=>(
            <div key={card.id} data-item="true">
              <CardItem card={card} onPointerDown={(e,c)=>startDrag(e,c,"card")} onDelete={deleteCard} onOpen={(url)=>window.open(url,"_blank")} selected={selected.has(card.id)} onToggleSelect={()=>toggleSelect(card.id)}/>
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

        <div style={{position:"fixed",bottom:80,left:16,zIndex:100,display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={()=>setScale(s=>Math.max(s*0.85,0.1))} style={zBtn}>−</button>
          <span style={{fontSize:10,color:"#aaa",minWidth:36,textAlign:"center"}}>{Math.round(scale*100)}%</span>
          <button onClick={()=>setScale(s=>Math.min(s*1.15,5))} style={zBtn}>+</button>
        </div>

        {status&&<div style={{position:"fixed",bottom:76,left:"50%",transform:"translateX(-50%)",zIndex:100,background:"rgba(0,0,0,0.7)",color:"#fff",fontSize:11,padding:"5px 14px",borderRadius:20,whiteSpace:"nowrap"}}>{status}</div>}

        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,padding:"10px 16px 14px",background:"rgba(240,240,240,0.95)",backdropFilter:"blur(8px)",borderTop:"1px solid #e0e0e0",display:"flex",gap:8,alignItems:"center"}}>
          <input value={inputUrl} onChange={e=>setInputUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!loading&&addCard()}
            placeholder="Pega un link de Instagram, TikTok, Pinterest..."
            style={{flex:1,background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,color:"#111",fontSize:13,padding:"10px 14px",outline:"none",fontFamily:"inherit"}}
            onFocus={e=>e.target.style.borderColor="#111"} onBlur={e=>e.target.style.borderColor="#e0e0e0"}/>
          <button onClick={addCard} disabled={loading||!inputUrl.trim()}
            style={{background:"#111",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:600,padding:"10px 18px",cursor:loading?"not-allowed":"pointer",opacity:(!inputUrl.trim()&&!loading)?0.3:1,whiteSpace:"nowrap",fontFamily:"inherit"}}>
            {loading?"...":"Añadir"}
          </button>
        </div>
      </div>
    </>
  );
}
