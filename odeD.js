function odeD()
{
  this.rdy=false;
  this.si;
  this.ss;
  this.ctx;
  this.manager;
  this.camCord=[5,5,5];
  this.camaramovio=true;
  this.acord=[0,0]; /*se actualiza solo*/
  this.oangle=Math.PI*3/2;
  this.viewWidth=0;
  this.viewHeight=0;
  this.fps=0;
  this.renderDistX=10;
  this.renderDistY=10;
  this.startDate=new Date();
  this.uid=-1;
  this.mouseCord=[0,0,0];
  this.dibujarcallback;
  
  this.texto='';

  this.polis=new Array();
  this.lastPolis=new Array();
  this.obj2d=new Array();
  this.sprites=new Array();
  
  this.asociarCanvas=function (htmlElem, callback)
  {
	this.ctx=htmlElem.getContext('2d');
	CanvasTextFunctions.enable(this.ctx);
	this.viewWidth=htmlElem.width;
	this.viewHeight=htmlElem.height;
	this.rdy=true;
	this.si=setInterval("mundo.dibujarTodo();mundo.fps++;",15);
	this.ss=setInterval("if(!divstatus)divstatus=document.getElementById('status');divstatus.textContent='FPS: '+mundo.fps;mundo.fps=0;",1000);
	if (callback) this.dibujarcallback=callback;
  }
  this.asociarManager=function (man)
  {
	  this.manager=man;
  }
  /*Helpers*/
  this.wrap2PI=function (ang)
  {
    if (ang<0) { ang=Math.PI*2+ang; ang=this.wrap2PI(ang); }
    if (ang>=Math.PI*2) { ang=ang-Math.PI*2; ang=this.wrap2PI(ang); }
    //ang=Math.round(ang*Math.PI)/1000/dil;
    return ang;
  }
  /*Cámara*/
  this.rotarCam=function (nang)
  {
    this.oangle=this.wrap2PI(this.oangle+nang);
	this.camaramovio=true;
  }
  this.setDirCam=function (nang)
  {
	this.oangle=this.wrap2PI(nang);
	this.camaramovio=true;
  }
  this.moverCam=function (cord)
  {
    this.camCord[0]+=cord[0]; this.camCord[0]=Math.round(this.camCord[0]*10)/10;
    this.camCord[1]+=cord[1]; this.camCord[1]=Math.round(this.camCord[1]*10)/10;
    this.camCord[2]+=cord[2]; this.camCord[2]=Math.round(this.camCord[2]*10)/10;
	this.camaramovio=true;
  }
  this.jumpCam=function (cord)
  {
	this.camCord[0]=cord[0]; this.camCord[0]=Math.round(this.camCord[0]*10)/10;
    this.camCord[1]=cord[1]; this.camCord[1]=Math.round(this.camCord[1]*10)/10;
    if (cord[2]) { this.camCord[2]=cord[2]; this.camCord[2]=Math.round(this.camCord[2]*10)/10; }
	this.camaramovio=true;
  }
  this.setacord=function ()
  {
    return [this.camCord[0]+Math.cos(this.oangle)*-15,this.camCord[1]+Math.sin(this.oangle)*-15];
  }
  this.gang=function (dh)
  {
    return (Math.atan(dh*25/250));
  }
  this.calcCord=function (ccord)
  {
    dh=(this.acord[0]-ccord[0])*Math.sin(this.oangle)-(this.acord[1]-ccord[1])*Math.cos(this.oangle);
    dv=(this.acord[0]-ccord[0])*Math.cos(this.oangle)+(this.acord[1]-ccord[1])*Math.sin(this.oangle);
    dz=(ccord[2]-this.camCord[2]);
	
	dh/=(this.camCord[2]/5);
	dv/=(this.camCord[2]/5);
	//dz/=(this.camCord[2]/5);
    
    //ydib=Math.pow(1.05,dv)*800;
    ydib=Math.pow(1.05,dv)*800;
    xdib=ydib*Math.tan(this.gang(dh));
    if (dh==0) { dt=Math.abs(ydib*Math.tan(this.gang(0.005))/0.005); } else { dt=Math.abs(xdib/dh); }
    ydib=ydib-dz*dt-this.camCord[2]*80-80+(10-this.camCord[2])*30;//*/;
    xdib=427+xdib;
    
    return [xdib,ydib];
  }
  /*Constructores*/
  this.crearPoli=function (id,dots,strkCol,fillCol)
  {
    if (!id) { id=this.uid; this.uid--; }
    if (strkCol=='') { strkCol='rgba(0,0,0,1)'; }
    if (fillCol=='') { fillCol='rgba(0,255,128,1)'; }
	var n=new odePoli(id,dots,strkCol,fillCol);
    this.polis.push(n);
	return n;
  }
  this.destroyPoli=function (po)
  {
	var eid=po.id;
	var mundo=this;
	this.polis.forEach(function (v,i){if(v.id==eid){mundo.polis.splice(i,1)}});
	return this;
  }
  this.crearObj2d=function (id,nombre,sprite,dir,width,height,cord,opc)
  {
    if (!id) { id=this.uid; this.uid--; }
    var n=new odeObj2d(id,nombre,sprite,dir,width,height,cord,opc);
	this.obj2d.push(n);
	return n;
  }
  this.destroyObj2d=function (po)
  {
	var eid=po.id;
	var mundo=this;
	this.obj2d.forEach(function (v,i){if(v.id==eid){mundo.obj2d.splice(i,1)}});
	return this;
  }
  this.crearSprite=function (id,img,dirs,ests,ceilW,ceilH,defW,defH)
  {
    this.sprites[id]=new odeSprite(id,img,dirs,ests,ceilW,ceilH,defW,defH);
	return this.sprites[id];
  }

  /*Dibujadores*/
  this.ordenaracord=function (objs)
  {
    var out=new Array();
    while(objs.length>0)
    {
      var menor=0;
      var sudist=-999999999999;
      for (var ob=0;ob<objs.length;ob++)
      {
		var esdist=Math.sqrt(Math.pow(this.acord[0]-objs[ob].pos[0],2)+Math.pow(this.acord[1]-objs[ob].pos[1],2))+(objs[ob].dots?10:0);
		if (esdist>sudist)
		{
			menor=ob;
			sudist=esdist;
		}
      }
      out.push(objs[menor]);
      objs.splice(menor,1);
    }
    return out;
  }
  this.dibujarPoli=function (pol)
  {
    this.ctx.beginPath();
    var i=0;
	pol.lastDrawPos=[0,0];
    for (var qu=0;qu<pol.dots.length;qu++)
    {
      dib=this.calcCord(pol.dots[qu]);
      if (i==0)
      {
		var fdib=dib;
        this.ctx.moveTo(dib[0],dib[1]);
      }
      else
      {
        this.ctx.lineTo(dib[0],dib[1]);
        if (i+1>=pol.dots.length)
        {
          this.ctx.lineTo(fdib[0],fdib[1]);
        }//*/
      }
	  pol.lastDrawPos[0]+=dib[0];
	  pol.lastDrawPos[1]+=dib[1];
      i++;
    }
	pol.lastDrawPos[0]/=pol.dots.length;
	pol.lastDrawPos[1]/=pol.dots.length;
    if (pol.fillCol!='-1') { this.ctx.fillStyle=pol.fillCol; this.ctx.fill(); }
    //if (pol.strkCol!='-1') { this.ctx.strokeStyle=pol.strkCol; this.ctx.stroke(); }
	this.ctx.closePath();
  }
  this.dibujarObj2d=function (obj)
  {
    var dib=this.calcCord(obj.pos);
    var dibr=this.calcCord([obj.pos[0],obj.pos[1],obj.pos[2]+1]);
    var rel=(dib[1]-dibr[1])/(this.camCord[2]/5);
    var dframe=this.sprites[obj.sprite].getFrame(this.wrap2PI(obj.dir-this.oangle),obj.accion);
    this.ctx.drawImage(this.sprites[obj.sprite].img,dframe[0],dframe[1],dframe[2],dframe[3],dib[0]-rel*obj.width/2,dib[1]-rel*obj.height/1.2,rel*obj.width,rel*obj.height);
	obj.lastDrawPos=dib;
	//alert(dib[0]-rel*obj.width/2);
  }
  this.dibujarHPMPNOObj2d=function (obj)
  {
	//var dib=this.calcCord(obj.pos);
    var dibr=this.calcCord([obj.pos[0],obj.pos[1],obj.pos[2]+obj.height]);
    //var rel=dib[1]-dibr[1];
    //this.ctx.drawImage(this.sprites[obj.sprite].img,dframe[0],dframe[1],dframe[2],dframe[3],dib[0]-rel*obj.width/2,dib[1]-rel*obj.height/1.2,rel*obj.width,rel*obj.height);
	var rel=obj.hp/obj.hpmax;
	this.ctx.fillStyle="rgb("+Math.floor(255-255*rel)+","+Math.floor(255*rel)+",100)";
	this.ctx.fillRect(dibr[0]-32*rel,dibr[1],64*rel,4);
	this.ctx.strokeRect(dibr[0]-32*rel,dibr[1],64*rel,4);
	//alert(dib[0]-rel*obj.width/2);
  }
  this.getPolisToDib=function ()
  {
	var mundo=this;
    var out=new Array();
    this.polis.forEach(function(po){
      if ((Math.abs(po.pos[0]-mundo.camCord[0])<=mundo.renderDistX)&&(Math.abs(po.pos[1]-mundo.camCord[1])<=mundo.renderDistY))
      {
        out.push(po);
      }
      else
      {
        //alert(this.polis[po].pos[0]);
      }
    });
    return out;
  }
  this.getObj2dToDib=function ()
  {
	var mundo=this;
    var out=new Array();
    this.obj2d.forEach(function (po) {
	  if ((Math.abs(po.pos[0]-mundo.camCord[0])<=mundo.renderDistX)&&(Math.abs(po.pos[1]-mundo.camCord[1])<=mundo.renderDistY))
      {
        out.push(po);
      }
    });
    return out;
  }
  /******************************************************************************************************/
  this.dibujarTodo=function ()
  {
    if (this.rdy==false) { /*alert("Aún no asociaste un CANVAS!");*/ }
    else
    {
		this.ctx.globalCompositeOperation='source-over';
		//this.ctx.clearRect(0,0,this.viewWidth,this.viewHeight);
		this.ctx.clearRect(130,0,this.viewWidth-130,this.viewHeight);
		this.ctx.clearRect(0,130,130,this.viewHeight-130);
		this.acord=this.setacord();
		/*polis y objs*/
		var dpolis=this.ordenaracord(this.getPolisToDib());
		this.lastPolis=dpolis;
		var dobjs=this.ordenaracord(this.getObj2dToDib());
		if ((this.camaramovio)||(1==1))
		{
			for (var d=0;d<dpolis.length;d++)
			{
				this.dibujarPoli(dpolis[d]);
			}
			this.camaramovio=false;
		}
		for (var d=0;d<dobjs.length;d++)
		{
			if (dobjs[d].marcar==1)
			{
				this.ctx.strokeStyle="rgb(255,255,0)";
				this.ctx.beginPath();
				var dib=this.calcCord(dobjs[d].pos);
				this.ctx.moveTo(dib[0],dib[1]-1.6*this.camCord[2]);
				this.ctx.lineTo(dib[0]+32,dib[1]);
				this.ctx.lineTo(dib[0],dib[1]+1.6*this.camCord[2]);
				this.ctx.lineTo(dib[0]-32,dib[1]);
				this.ctx.closePath();
				this.ctx.stroke();
			}
			else if ((dobjs[d].marcar>=2)&&(dobjs[d].marcar<=10))
			{
				if (Math.floor(dobjs[d].marcar)%2==0) this.ctx.strokeStyle="rgb(255,0,0)";
				else  this.ctx.strokeStyle="rgb(255,255,255)";
				dobjs[d].marcar+=0.1;
				this.ctx.beginPath();
				var dib=this.calcCord(dobjs[d].pos);
				this.ctx.moveTo(dib[0],dib[1]-1.6*this.camCord[2]);
				this.ctx.lineTo(dib[0]+32,dib[1]);
				this.ctx.lineTo(dib[0],dib[1]+1.6*this.camCord[2]);
				this.ctx.lineTo(dib[0]-32,dib[1]);
				this.ctx.closePath();
				this.ctx.stroke();
				if (dobjs[d].marcar>10) dobjs[d].marcar=0;
			} 
			this.dibujarObj2d(dobjs[d]);
		}
		//if dibujar hp
		this.ctx.strokeStyle="rgb(255,255,0)";
		for (var d=0;d<dobjs.length;d++)
		{
			if (dobjs[d].hpmax>0) this.dibujarHPMPNOObj2d(dobjs[d]);
		}
		//mouse seek
		if (1==0)
		{
			this.ctx.strokeStyle="rgb(255,255,255)";
			this.ctx.beginPath();
			var dib=this.calcCord(this.mouseCord);
			//dib[1]+=-24;
			this.ctx.moveTo(dib[0],dib[1]-1.6*this.camCord[2]);
			this.ctx.lineTo(dib[0]+32,dib[1]);
			this.ctx.lineTo(dib[0],dib[1]+1.6*this.camCord[2]);
			this.ctx.lineTo(dib[0]-32,dib[1]);
			
			this.ctx.closePath();
			
			this.ctx.stroke();
		}
		this.ctx.globalCompositeOperation='source-over';
		
		if (this.dibujarcallback) this.dibujarcallback();
    }
  }
  /******************************************************************************************************/
}

function odePoli(id,dots,strkCol,fillCol)
{
  this.id=id;
  this.dots=dots;
  this.strkCol=strkCol;
  this.fillCol=fillCol;
  this.pos=[0,0,9999999999];
  this.lastDrawPos=[0,0];
  var p=0;
  for (var d=0;d<dots.length;d++)
  {
    this.pos[0]+=dots[d][0];
    this.pos[1]+=dots[d][1];
    if (dots[d][2]<this.pos[2]) this.pos[2]=dots[d][2];
    p++;
  }
  
  if (p>0) { this.pos=[Math.floor(this.pos[0]*10/p)/10,Math.floor(this.pos[1]*10/p)/10,this.pos[2]]; }
}

function odeObj2d(id,nombre,sprite,dir,width,height,cord,opc)
{
  this.id=id;
  this.nombre=nombre;
  this.sprite=sprite;
  this.width=width;
  this.height=height;
  this.dir=dir;
  this.accion=0;
  this.pos=cord;
  this.adds=new Array();
  this.lastDrawPos=[];
  
  this.hp=0;
  this.hpmax=0;
  this.mp=0;
  this.mpmax=0;
  this.marcar=0;
  /*if (opc[0]!=undefined) { this.showNombre=opc[0]; } else { this.showNombre=false; }
  if (opc[1]!=undefined) { this.showSombra=opc[1]; } else { this.showSombra=false; }
  if (opc[2]!=undefined) { this.showHP=opc[2]; } else { this.showHP=0; }
  if (opc[3]!=undefined) { this.showMP=opc[3]; } else { this.showMP=0; }
  if (opc[4]!=undefined) { this.showAdds=opc[4]; } else { this.showAdds=0; }*/
}

function odeSprite(id,img,dirs,ests,ceilW,ceilH,defW,defH)
{
	this.id=id;
	this.img=img;
	this.dirs=dirs;
	this.ests=ests;
	this.ceilW=ceilW;
	this.ceilH=ceilH;
	this.defW=defW;
	this.defH=defH;
	this.getFrame=function (dirIn,estIn)
	{
		if (dirIn<0) alert("WEEEEI");
		var rx=0;
		var ry=0;
		if (this.dirs==4)
		{
			var c=Math.PI/2;
			var i=Math.round(dirIn/c);
			if (i>=this.dirs) i=0;
			rx=this.ceilW*i;
			/*if ((dirIn>=45)&&(dirIn<135)) { rx=0; }
			else if ((dirIn>=135)&&(dirIn<225)) { rx=this.ceilW*1; }
			else if ((dirIn>=225)&&(dirIn<315)) { rx=this.ceilW*2; }
			else { rx=this.ceilW*3; }*/
		}
		else if (this.dirs==8)
		{
			var c=Math.PI/4;
			var i=Math.round(dirIn/c);
			if (i>=this.dirs) i=0;
			rx=this.ceilW*i;
			/*if ((dirIn>=0)&&(dirIn<45)) { rx=this.ceilW*7; }
			else if ((dirIn>=45)&&(dirIn<90)) { rx=0; }
			else if ((dirIn>=90)&&(dirIn<135)) { rx=this.ceilW*1; }
			else if ((dirIn>=135)&&(dirIn<180)) { rx=this.ceilW*2; }
			else if ((dirIn>=180)&&(dirIn<225)) { rx=this.ceilW*3; }
			else if ((dirIn>=225)&&(dirIn<270)) { rx=this.ceilW*4; }
			else if ((dirIn>=270)&&(dirIn<315)) { rx=this.ceilW*5; }
			else { rx=this.ceilW*6; }*/
		}

		if ((estIn>=0)&&(estIn<this.ests))
		{
			ry=estIn*this.ceilH;
		}
		return [rx,ry,this.ceilW,this.ceilH];
	}
}