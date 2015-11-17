function Manager()
{
	this.rdy=false;
	this.si;
	this.fps=0;
	this.startDate=new Date();
	this.uid=-1;
	this.mundo;
	this.mapsire;
	this.sprites;
	this.odes=new Array();
	this.odesUns=new Array();
	this.odesArs=new Array();
	this.odesPys=new Array();
	this.odesFxs=new Array();


	this.asociarMundo=function (mundo)
	{
		this.mundo=mundo;
		this.mundo.asociarManager(this);
		this.sprites=mundo.sprites;
		this.si=setInterval("manager.loop();",15);
	}
	this.asociarMapsire=function (mapsire)
	{
		mapsire.tl=new Array();
		for(var i=0;i<mapsire.terrlevel.length;i++)
		{
			mapsire.tl[i]=parseInt(mapsire.terrlevel[i]);
		}
		mapsire.terrlevel=mapsire.tl;
		this.mapsire=mapsire;
	}
	
	this.garbageRun=function (o)	{
		man=this;
		if (o=='un')
		{
			this.odesUns.forEach(function (v,i) {
				if ((v.duracion>=0)&&((new Date()).getTime()-v.checkDate>v.duracion))
				{
					man.destroyOde(v);
					delete man.odesUns[i];
				}
			});
		}
		else if (o=='py')
		{
			this.odesPys.forEach(function (v,i) {
				if ((v.duracion>=0)&&((new Date()).getTime()-v.checkDate>v.duracion))
				{
					man.destroyOde(v);
					delete man.odesPys[i];
				}
			});
		}
		else if (o=='fx')
		{
			this.odesFxs.forEach(function (v,i) {
				if ((v.duracion>=0)&&((new Date()).getTime()-v.checkDate>v.duracion))
				{
					man.destroyOde(v);
					man.odesFxs.splice(i,1);
				}
			});
		}
	}
	
	this.loop=function () {
		man=this;
		this.garbageRun('fx');
		this.odesFxs.forEach(function (v,i) {
			if (v.movspeed) {
				v.x+=Math.cos(v.dir)*v.movspeed;
				v.y+=Math.sin(v.dir)*v.movspeed;
				v.obj.pos[0]+=Math.cos(v.dir)*v.movspeed;
				v.obj.pos[1]+=Math.sin(v.dir)*v.movspeed;
			}
		});
	}
	
	this.readUns=function (data,opc) {
		var man=this;
		data.forEach(function (v,i) {
			
			if (!man.odesUns[v[0]])
			{
				man.odesUns[v[0]]=man.crearOde(v[0],v[3],'un',v[1],v[2],v[6]).setDuracion(100).setHpMp(v[8],v[9],v[10],v[11]).setDueno(v[5]);
			}
			else
			{
				mode=man.odesUns[v[0]];
				if ((mode.x!=v[1])||(mode.y!=v[2]))
				{
					mode.jumpTo(v[1],v[2]);
				}
				if (mode.img!=v[3])
				{
					mode.setImg(v[3]);
				}
				mode.setDir(v[6]).setHpMp(v[8],v[9],v[10],v[11]).touch();
				if (v[12]==caminando) {
					mode.paso++;
					var pa=Math.floor(mode.paso/3)%4;
					if (pa==2) pa=0; else if (pa==3) pa=2;
					mode.obj.accion=pa;
				} else if (v[12]==casteando) {
					if (mode.obj.accion<3) { mode.obj.accion=3; mode.paso=0; }
					else
					{
						mode.paso++;
						if (mode.paso>15) mode.obj.accion=5;
						else if (mode.paso>10) mode.obj.accion=4;
						else mode.obj.accion=3;
					}
				} else if (v[12]==descansando) {
					mode.obj.accion=5; mode.paso=0;
				}
			}
		});
		this.garbageRun('un');
	}
	
	this.readArs=function (data,opc) {
		var man=this;
		data.forEach(function (v,i) {
			if (!man.odesArs[v[0]])
			{
				man.odesArs[v[0]]=man.crearOde(v[0],v[3],'ar',v[1],v[2],0);//.setZ(0);
			}
			else
			{
				if (man.odesArs[v[0]].img!=v[3])
				{
					//enviar animacion del arbol talandose
					man.odesArs[v[0]].setImg(v[3]);
				}
			}
		});
	}
	
	this.readPys=function (data,opc) {
		var man=this;
		data.forEach(function (v,i) {
			if (!man.odesPys[v[0]])
			{
				man.odesPys[v[0]]=man.crearOde(v[0],2000+v[3],'py',v[1],v[2],0).setDuracion(1000);
				//mundo.fps++;
			}
			else
			{
				mode=man.odesPys[v[0]];
				if ((mode.x!=v[1])||(mode.y!=v[2]))
				{
					mode.jumpTo(v[1],v[2]);
				}
				//mode.setZ(Math.min(Math.sqrt(Math.pow(v[1]-v[4],2)+Math.pow(v[2]-v[5],2))/2000,Math.sqrt(Math.pow(v[1]-v[6],2)+Math.pow(v[2]-v[7],2))/2000));
				if ((mode.accion==0)&&((v[4]==undefined)||(v[5]==undefined)||(Math.sqrt(Math.pow(v[1]-v[4],2)+Math.pow(v[2]-v[5],2))<500)))
				{
					for (var f=0,x=0;f<16;f++)
					{				
						var n=man.crearOde(0,2001,'fx',v[4],v[5],x).setDuracion(500).setMovspeed(0.05).setObjWH(0.2,0.2);
						man.odesFxs.push(n);
						x+=Math.PI/8;
					}//*/mode.accion=1;
					mode.setAccion(1).setDuracion(1);
				}
			}
		});
		this.garbageRun('py');
	}
	
	this.doEfx=function (tipo,fpos,tpos,opc)
	{
		
	}
	
	this.crearPisos=function () {
		var x, y, inc=1, ind=inc/2,
			z00=0, z01=128, z10=1, z11=129;
		
		for (y=1;y<128;y+=inc)
		{
			for (x=1;x<128;x+=inc)
			{
				this.mundo.crearPoli(z10,[[x-ind,y-ind,mapsire.terrlevel[z00]/2],[x+ind,y-ind,mapsire.terrlevel[z10]/2],[x+ind,y+ind,mapsire.terrlevel[z11]/2],[x-ind,y+ind,mapsire.terrlevel[z01]/2]],'-1','rgb(0,'+(y*2)+','+(x*2)+')');
				z00++;
				z01++;
				z10++;
				z11++;
				//alert(mapsire[z00]);
			}
			z00++;
			z01++;
			z10++;
			z11++;//*/
		}
	}

	this.crearOde=function (id,img,tipo,x,y,dir) {
		if (!id) { id=this.uid; this.uid--; }
		if (!img) { img=0; }
		var n=new Ode(id,img,tipo);
		this.odes.push(n);
		n.obj=this.mundo.crearObj2d(0,'',img,Math.PI,this.mundo.sprites[img].defW,this.mundo.sprites[img].defH,[0,0,0],{});
		n.jumpTo(x,y).setDir(dir);
		return n;
	}
	this.destroyOde=function (o) {
		o.selfDestroy();
		return;
		/*var oid=o.id;
		var oti=o.tipo;
		var man=this;
		this.odes.forEach(function (v,i) { if ((v.id==oid)&&(v.tipo==oti)) {delete man.odes[i];} });
		o.selfDestroy();*/
	}
}

function Ode(id,img,tipo)
{
	this.id=id;
	this.img=img;
	this.tipo=tipo;
	this.x=0;
	this.y=0;
	this.z=0;
	this.dir=0;
	this.movspeed=0;
	this.obj;
	this.dueno;
	this.team;
	this.data;
	this.hp;
	this.hpmax;
	this.mp;
	this.mpmax;
	this.nombre;
	this.accion=0;
	this.paso=(id*7);
	this.tipopaso=0;
	this.startDate=(new Date()).getTime();
	this.checkDate=(new Date()).getTime();
	this.duracion=-1;
	
	this.jumpTo=function (x,y){
			this.x=x;
			this.y=y;
			var tx, ty, tz, tfx, tfy, dx, dy, ii;
			tx=128*x/100000-0.5;	ty=128*y/100000-0.5;	tfx=Math.floor(tx);	tfy=Math.floor(ty);	ii=tfy*128+tfx;
				dx=(tx-tfx)*(mapsire.terrlevel[ii+1]-mapsire.terrlevel[ii]);
				dy=(ty-tfy)*(mapsire.terrlevel[ii+128]-mapsire.terrlevel[ii]);
			tz=this.z+(dx+dy+mapsire.terrlevel[ii])/2; tx+=0.5;	ty+=0.5;//*/
			this.obj.pos=[tx,ty,tz];
		return this;
	}
	this.setZ=function (n) {
		var dz=n-this.z;
		this.z=n;
		this.obj.pos[2]+=dz;
		return this;
	}
	this.setDir=function (n) {
		this.dir=n;
		this.obj.dir=n;
		return this;
	}
	this.setMovspeed=function (n) {
		this.movspeed=n;
		return this;
	}
	this.setImg=function (n) {
		this.img=n;
		this.obj.sprite=n;
		return this;
	}
	this.setDueno=function (n) {
		this.dueno=n;
		if (n==0) this.team=n;
		else this.team=n/Math.abs(n);
		return this;
	}
	this.setAccion=function (n) {
		this.accion=n;
		//this.obj.sprite=n;
		return this;
	}
	this.setDuracion=function (n) {
		this.duracion=n;
		return this;
	}
	this.setObjWH=function (w,h) {
		this.obj.width=w;
		this.obj.height=h;
		return this;
	}
	this.setHpMp=function (hp,hpm,mp,mpm) {
		this.obj.hp=hp;
		this.obj.hpmax=hpm;
		this.obj.mp=mp;
		this.obj.mpmax=mpm;
		return this;
	}
	this.touch=function () {
		this.checkDate=(new Date()).getTime();
		return this;
	}
	this.selfDestroy=function () {
		mundo.destroyObj2d(this.obj);
	}
}