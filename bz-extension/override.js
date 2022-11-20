function insertAppCode(curIframeId){
if(curIframeId){console.log('call be bg ...')}else{console.log('call for client')}window._eval={
  _leftKeys:{"{":"}","[":"]","(":")"},
  bd:{"{":"}","[":"]","(":")","'":"'",'"':'"','`':'`'},
  db:{"}":"{","]":"[",")":"(","'":"'",'"':'"','`':'`'},
  _tmpNum:1,
  exeGroupCode:function(d){
    if(!d||![String,Array].includes(d.constructor)){
      return d
    }
    if(d.constructor==String){
      return _eval._exeCode(d)
    }else if(d)
    d.forEach(x=>{
      if(x.f){
        x.ps=x.ps||[]
        let xx=_eval._exeCode(x.f,0,0,1)
        if(xx.n){
          xx.d[xx.n](...x.ps)
        }else{
          xx.v(...x.ps)
        }
      }else if(x.k){
        let xx=_eval._exeCode(x.k,0,0,1)
        if(xx.n){
          xx.d[xx.n]=x.v
        }else{
          window[xx.k]=x.v
        }
      }else{
        _eval._exeCode(x.c)
      }
    })
  },
  _getTmpDataName:function(){
    return "f"+(this._tmpNum++)
  },
  _throwErr:function(s){
    alert(_bzMessage._system._error._syntaxError+s)
  },
  _exeFun:function(f,p,_outMap,_inMap){
    _outMap=_eval._initOutMap(_outMap),_inMap=_inMap||{};
    p=(p||[]).map(x=>_eval._getFinalValue(x))
    if(f.constructor!=Function){
      if(_eval._isFun(f)){
        f={v:f}
      }
      if(f.v.constructor==Function){
        if(f.n){
          p=_buildTF(p)
          return f.d[f.n](...p)
        }else{
          f=f.v
        }
      }else if(f.v&&(f.v.k=="function"||f.v.k=="=>")){
        return _exe(f.v,f.d,p)
      }else{
        _eval._throwErr()
      }
    }
    p=_buildTF(p)
    p= f(...p)
    return p

    function _buildTF(p){
      p=p.map(x=>{
        if(x&&x._bzFun=="_bzFun"){
          return function(){
            return _exe(x,window,[...arguments])
          }
        }
        return x
      })
      return p
    }

    function _exe(f,d,p){
      let _map=_eval._buildScopeDataMap(_outMap,_inMap),
      _tmpMap={}
      f.e.forEach((x,i)=>{
        if(x.ps){
          _tmpMap[x.ps[0]]=p[i]
        }else{
          _tmpMap[x]=p[i]
        }
      })
      _tmpMap.arguments=[...p]
      _tmpMap.this=d
      f=_eval._exeCode(f.c,_map,_tmpMap)
      _eval._mergedataMap(_outMap,_inMap,_map)
      if(f&&f._throw=="_return"){
        f=_eval._getFinalValue(f)
        return f
      }
    }
  },
  _exeIfElse:function(v,vs,_map,_tmpMap){
    let r;
    if(v.k!="else"){
      r=_eval._exeCode(v.e,_map,_tmpMap)
    }
    if(v.k=="else"||r){
      r=_eval._exeCode(v.c,_map,_tmpMap)
      
      while(vs[0]&&["else","else if"].includes(vs[0].k)){
        vs.shift()
      }

    }
    return r
  },
  _exeLoop:function(v,_map,_tmpMap){
    let _first=1,r,rr;
    while(1){
      if(v.k=="for"&&_first){
        _eval._exeCode(v.e[0],_map,_tmpMap)
      }
      if(v.k=="for"){
        rr=_eval._exeCode(v.e[1],_map,_tmpMap)
      }else if(v.k!=="do"||!_first){
        rr=_eval._exeCode(v.e,_map,_tmpMap)
      }
      if((v.k=="do"&&_first)||rr){
        _first=0
        r=_eval._exeCode(v.c,_map,_tmpMap)
        if(r&&r._throw){
          if(r._throw!="_continue"){
            if(r._throw=="_break"){
              r=undefined
            }
            break
          }
          r._throw=0
        }
        if(v.k=="for"){
          _eval._exeCode(v.e[2],_map,_tmpMap)
        }
      }else{
        break
      }
    }
    return r
  },
  _exeTry:function(v,_map,_tmpMap){
    let r;
    try{
      r=_eval._exeCode(v.c,_map,_tmpMap)
      return r
    }catch(e){
      _tmpMap={}
      _tmpMap[v.e[0]]=e
      r=_eval._exeCode(v.ec,_map,_tmpMap)
      return r
    }finally{
      if(v.f){
        _tmpMap={}
        r=_eval._exeCode(v.f,_map,_tmpMap)
      }
      return r
    }
  },
  _exeSwitch:function(v,_map,_tmpMap){
    let vv=_eval._exeCode(v.e,_map,_tmpMap),_continue,r
    v.c.find(x=>{
      if(_continue||x.k=="default"||vv==_eval._getFinalValue(_eval._exeCode(x.v,_map,_tmpMap))){
        r=_eval._exeCode(x.cs,_map,_tmpMap)
        if(r&&_eval._isBzData(r)&&r._throw){
          if(r._throw!="_continue"){
            if(r._throw=="_break"){
              r._throw=0
            }
            return 1
          }
          _eval._throwErr()
        }
        _continue=1
      }
    })
    return r
  },
  _initOutMap:function(_outMap){
    _outMap=_outMap||{
      $parameter:window.$parameter,
      $module:window.$module,
      $project:window.$project,
      $test:window.$test,
      $loop:window.$loop,
      $result:window.$result,
      $element:window.$element
    }
    return _outMap
  },
  exe:function(){
    return _eval._exeCode(...arguments)
  },
  _exeCode:function(vs,_outMap,_inMap,_inBzData){
    _outMap=_eval._initOutMap(_outMap),_inMap=_inMap||{};
    if(vs.constructor==String){
      vs=_eval._parseCode(vs)
    }else if(vs.constructor!=Array){
      vs=[vs]
    }
    let vvs=[],r,d,rs=[],_tmpFun
    vs.forEach(x=>{
      if(x.k=="function"||x.k=="=>"){
        if(x.n){
          _outMap[x.n]=x
        }else{
          _tmpFun=x
        }
        x._bzFun="_bzFun"
      }else{
        vvs.push(x)
      }
    })
    if(!vvs.length&&_tmpFun){
      return _tmpFun
    }
    while(vvs.length){
      let v=vvs.shift()
      if(["let","const","var","=","+=","-=","*=","/=","^=","%=","&=","|=","&&=","||="].includes(v.k)){
        rs=[]
        v.c=v.c||[]
        v.c=v.c.constructor==Array?v.c.map(y=>y.constructor==Array?y[0]:y):v.c;
        let vr=_eval._exeCode(v.c,_outMap,_inMap)
        if(v.k=="var"){
          _eval._setValue(v.n,_outMap,_inMap,_outMap,vr)
        }else if(["let","const"].includes(v.k)){
          _eval._setValue(v.n,_inMap,_inMap,_inMap,vr)
        }else{
          rs=[_eval._setValue(v.n,_outMap,_inMap,0,vr,v.k)]
        }
      }else if(["if","else if","else","for","while","do","try","switch"].includes(v.k)){
        rs=[]
        let _map=_eval._buildScopeDataMap(_outMap,_inMap),
            _tmpMap={}
        if(["if","else if","else"].includes(v.k)){
          r=_eval._exeIfElse(v,vvs,_map,_tmpMap)
        }else if(["for","while","do"].includes(v.k)){
          r=_eval._exeLoop(v,_map,_tmpMap)
        }else if(v.k=="try"){
          r=_eval._exeTry(v,_map,_tmpMap)
        }else{
          r=_eval._exeSwitch(v,_map,_tmpMap)
        }
        _eval._mergedataMap(_outMap,_inMap,_map)
        if(r&&_eval._isBzData(r)&&r._throw){
          return r
        }
        if(r){
          rs.push(r)
        }
      }else if(v.k=="..."){
        r=_eval._getFinalValue(_eval._exeCode(v.c,_outMap,_inMap))
        rs.push([...r])
      }else if(v.k=="return"){
        r=_eval._buildBzData(_eval._exeCode(v.c,_outMap,_inMap))
        r._throw="_return"
        return r
      }else if(v.k=="break"){
        r= _eval._buildBzData()
        r._throw="_break"
        return r
      }else if(v.k=="continue"){
        r= _eval._buildBzData()
        r._throw="_continue"
        return r
      }else if(v.k=="throw"){
        r=_eval._exeCode(v.c,_outMap,_inMap)
        throw r
      }else if(v.k=="delete"){
        r=_eval._exeCode(v.c,_outMap,_inMap,1)
        delete r.d[r.n]
        rs.push(true)
      }else if(v.k=="new"){
        let x=v.c[0],rrs=[...x.cs]
        r=rrs.shift().ps.map(y=>_eval._exeCode(y,_outMap,_inMap))
        
        if(x.dd.includes(".")){
          let dd=x.dd.split(".")
          let rr=window[dd.shift()]
          while(dd.length>1){
            rr=rr[dd.shift()]
          }
          r=new rr[dd[0]](...r)
        }else{
          r=new window[x.dd](...r)
        }

        while(rrs.length){
          let rr=rrs.shift()
          rr=rr.substring(1)
          if(rrs.length){
            let pp=rrs.shift().ps.map(y=>_eval._exeCode(y,_outMap,_inMap))
            
            r=r[rr](...pp)
          }else{
            r-r[rr]
          }
        }
        rs.push(r)
      }else if(v.k=="typeof"){
        r=_eval._exeCode(v.c,_outMap,_inMap,1)
        r=typeof _eval._getFinalValue(r)

        rs.push(r)
      }else if(v.dd){
        let on=v.dd,nn;
        if(v.dd[0]=="."){
          r=_eval._getFinalValue(rs.pop())
          nn=_eval._getTmpDataName()
          _outMap[nn]=r
          v.dd=nn+v.dd
        }
        rs.push(_eval._getRefData(v,_outMap,_inMap))
        if(nn){
          v.dd=on
        }
      }else{
        if(v.k=="["){
          r=[];
          v.ps.forEach(x=>{
            x=x.constructor==Array?x.map(y=>y.constructor==Array?y[0]:y):x;
            let y=_eval._exeCode(x,_outMap,_inMap)
            if(x.k=="..."){
              r.push(...y)
            }else{
              r.push(y)
            }
          })
          if(rs.length){
            let rr=rs[rs.length-1]
            if(!_eval._isSign(rr)){
              r=r.pop()
              if(_eval._isBzData(rr)){
                if(rr.d&&r.n){
                  rr.d=rr.v
                  rr.n=r
                  rr.v=rr.d[rr.n]
                }else{
                  rr.v=rr.v[r]
                }
              }else{
                rr=rr[r]
                rs[rs.length-1]=rr
              }
              continue
            }
          }
          rs.push(_eval._buildBzData(r))
        }else if(v.k=="{"){
          r={}
          v.ps.forEach(x=>{
            Object.keys(x).forEach(y=>r[y]=_eval._exeCode(x[y],_outMap,_inMap))
          })
          rs.push(_eval._buildBzData(r))
        }else if(v.k=="("){
          if(rs.length){
            let rr=rs[rs.length-1]
            let fr=_eval._getFinalValue(rr)
            if(_eval._isFun(fr)){
              r=v.ps.map(x=>_eval._exeCode(x,_outMap,_inMap));
              rs[rs.length-1]=_eval._exeFun(rr,r,_outMap,_inMap)
              continue
            }
          }
          r=_eval._exeCode(v.ps,_outMap,_inMap)
          rs.push(_eval._buildBzData(r))
        }else if(v.constructor==Array){
          rs=[_eval._exeCode(v,_outMap,_inMap,1)]
        }else if("'\"\`".includes(v[0])){
          rs.push(_eval._buildBzData(v.substring(1,v.length-1)))
        }else if(v[0]=="/"&&v.length>1){
          let _idx=v.lastIndexOf("/"),op=v.substring(_idx+1)
          r=new RegExp(v.substring(1,_idx),op)
          rs.push(r)
        }else if(_eval._isNumeric(v)){
          rs.push(JSON.parse(v))
        }else if(_eval._isSign(v[0])){
          rs.push(v)
        }else if(v=="undefined"){
          rs.push(_eval._buildBzData(undefined))
        }else if(v=="null"){
          rs.push(_eval._buildBzData(null))
        }else if(v=="true"){
          rs.push(_eval._buildBzData(true))
        }else if(v=="false"){
          rs.push(_eval._buildBzData(false))
        }else if(v[0]=="."){
          v=v.split(".").filter(x=>x)
          r=rs[rs.length-1]
          v.forEach(x=>{
            r.d=_eval._getFinalValue(r.v)
            r.n=x
            r.v=r.d[x]
          })
        }else{
          if(_eval._isBzData(v)){
            rs.push(v)
          }else{
            rs.push(_eval._getValue(v,_outMap,_inMap))
          }
        }
      }
    }
    if(rs.find(x=>_eval._isSign(x))){
      r=_eval._countItems(rs)
    }else{
      r=rs.pop()
    }
    if(_eval._isBzData(r)&&r._throw){
      return r
    }else if(_eval._isFun(r)){
      return r
    }
    return _inBzData?_eval._buildBzData(r):_eval._getFinalValue(r)

  },
  _isFun:function(fr){
    return fr&&(fr.constructor==Function||fr._bzFun=="_bzFun")
  },
  _getRefData:function(v,_outMap,_inMap){
    let r=_eval._getValue(v.dd,_outMap,_inMap)
    v.cs.forEach(x=>{
      if(x.k){
        let d=x.ps.find(y=>_eval._isSign(y)||y[0]==".")?_eval._exeCode(x.ps,_outMap,_inMap):x.ps.map(y=>{
          if(y&&y.constructor==Array){
            y=y.map(z=>z&&z.constructor==Array?_eval._exeCode(z,_outMap,_inMap,1):z)
          }
          return _eval._exeCode(y,_outMap,_inMap)
        })
        if(x.k=="("){
          if(!d||d.constructor!=Array){
            d=[d]
          }
          if(r.n){
            r.v=_eval._exeFun(r,d,_outMap,_inMap)
            r.n=r.d=0
          }else{
            r.v=_eval._exeFun(r,d,_outMap,_inMap)
          }
        }else{
          if(d&&d.constructor==Array){
            d=d.pop()
          }
          r.d=r.v
          r.n=d
          r.v=r.d[d]
        }
      }else{
        x=x.split(".").filter(x=>x)
        x.forEach(y=>{
          r.d=r.v
          r.n=y
          r.v=r.d[y]
        })
      }
    })
    return r
  },
  _countItems:function(ps,c){
    let vs=[],r,s,prs,ss;
    ps.find((x,q)=>{
      if(x=="?"){
        vs=_eval._getFinalValue(_countGroup(vs))
        let qs=_eval._findKeyOuterBlock(ps,":",q+1,{"?":":"})
        if(vs){
          r=_eval._countItems(qs.p)
        }else{
          r=_eval._countItems(qs.e)
        }
        return 1
      }
      if(!["&&","||",">","<",">=","<=","==","===","!=","!==","^","&","|"].includes(x)){
        if(ss){
          if(_eval._isBzData(x)&&x.n){
            if(ss=="++"){
              vs.push(x)
              x.v+=1
              x.d[x.n]=x.v            
            }else if(ss=="--"){
              vs.push(x)
              x.v-=1
              x.d[x.n]=x.v            
            }else if(ss=="!"){
              vs.push(!x.v)
            }else if(ss=="!!"){
              vs.push(!!x.v)
            }else{
              vs.push(~x.v)
            }
            ss=0
          }else{
            if(ss=="!"){
              vs.push(!x)
              ss=0
            }else if(ss=="!!"){
              vs.push(!!x)
              ss=0
            }else if(ss=="~"){
              vs.push(~x)
              ss=0
            }else{
              _eval._throwErr()
            }
          }
          return
        }
        if(x=="*"||x=="/"||x=="%"){
            s=x
        }else if(s){
          vs[vs.length-1]=_eval._count(vs[vs.length-1],s,x)
          s=""
        }else if(x=="++"||x=="--"||x=="!"||x=="~"||x=="!!"){
          if(s||!vs.length||_eval._isSign(vs[vs.length-1])){
            ss=x
          }else{
            let rv=vs[vs.length-1]
            if(x=="++"){
              rv.d[rv.n]+=1
            }else{
              rv.d[rv.n]-=1
            }
          }
        }else{
          vs.push(x)
        }
      }else{
        vs=_eval._getFinalValue(_countGroup(vs))
        if(x=="&&"){
          if(!vs){
            r=_eval._buildBzData(vs)
            return 1
          }
        }else if(x=="||"){
          if(vs){
            r=_eval._buildBzData(vs)
            return 1
          }
        }else{
          prs={v:vs,c:x}
        }
        vs=[]
      }
    })
    if(!r){
      if(vs.length){
        r=_countGroup(vs)
      }
    }
    return _eval._getFinalValue(r)
    function _countGroup(vs){
      [["+","-"],[">>","<<"]].forEach(x=>vs=_countPs(vs,x))
      vs=vs[0]
      if(prs){
        vs=_eval._count(prs.v,prs.c,vs)
        prs=0
      }
      return vs
    }
    function _countPs(vs,c){
      let rs=[],s;
      for(let i=0;i<vs.length;i++){
        let v=vs[i]
        if(c.includes(v)){
          if(!i){
            if("+-".includes(v)){
              rs=[0]
              s=v
            }else if(_eval._isSign(v)){
              _eval._throwErr()
            }
          }else{
            if(s){
              _eval._throwErr()
            }
            s=v
          }
        }else if(s){
          let v1=_eval._getFinalValue(rs[rs.length-1])
          v=_eval._getFinalValue(v)
          rs[rs.length-1]=_eval._count(v1,s,v)
          s=""
        }else{
          rs.push(v)
        }
      }
      return rs
    }
  },
  _buildBzData:function(v,d,n){
    if(_eval._isBzData(v)){
      return v
    }
    return {
      _bzData:"_bzData",
      v:v,
      d:d,
      n:n
    }
  },
  _isBzData:function(v){
    return v&&v._bzData=="_bzData"
  },
  _getFinalValue:function(r){
    if(_eval._isBzData(r)){
      return r.v
    }
    return r
  },
  _isSign:function(c){
    return c&&"~!=><+-*/%^&|?:".includes(c[0])
  },
  _count:function(d1,c,d2){
    d1=_eval._getFinalValue(d1)
    d2=_eval._getFinalValue(d2)
    switch(c){
      case "+": return d1+d2
      case "-": return d1-d2
      case "*": return d1*d2
      case "/": return d1/d2
      case "==": return d1==d2
      case "===": return d1===d2
      case ">": return d1>d2
      case "<": return d1<d2
      case ">>": return d1>>d2
      case "<<": return d1<<d2
      case ">=": return d1>=d2
      case "<=": return d1<=d2
      case "!=": return d1!=d2
      case "!==": return d1!==d2
      case "&": return d1&d2
      case "|": return d1|d2
      case "&&": return d1&&d2
      case "||": return d1||d2
      case "%": return d1%d2
      case "^": return d1^d2
    }
  },
  _mergedataMap:function(_outMap,_inMap,_map){
    Object.keys(_map).forEach(k=>{
      if(Object.keys(_inMap).includes(k)){
        _inMap[k]=_map[k]
      }else{
        _outMap[k]=_map[k]
      }
    })
  },
  _isNumeric:function(a){
    var b = a && a.toString();
    return (!a||a.constructor!=Array) && b - parseFloat(b) + 1 >= 0
  },
  _getValue:function(n,_outMap,_inMap){
    let ns=n.split("."),_map;
    n=ns.shift()
    if(n=="eval"){
      return _eval._buildBzData(_eval._exeCode,_eval,"_exeCode");
    }else if(_eval._isNumeric(n)||n.match(/^['"`].*[`"']$/)){
      let nn=_eval._getTmpDataName()
      _outMap[nn]=_eval._exeCode(n)
      n=nn
    }
    if(Object.keys(_inMap).includes(n)){
      _map=_inMap
    }else if(Object.keys(_outMap).includes(n)){
      _map=_outMap
    }else{
      _map=window
    }
    while(ns.length){
      _map=_map[n]
      n=ns.shift()
    }

    return {
      d:_map,
      n:n,
      v:_map[n],
      _bzData:"_bzData"
    }
  },
  _setValue:function(n,_outMap,_inMap,_defMap,v,_sign){
    let _map,ns;
    if(n.constructor==String){
      ns=n.split(".")
      n=ns.shift()
  
      _map=_eval._getDataMap(n,_outMap,_inMap,_defMap)
    }else{
      _map=_eval._getRefData(n,_outMap,_inMap)
    }
    if(n.constructor!=String||!_defMap||_map==_defMap){
      if(n.constructor==String){
        while(ns.length){
          _map=_map[n]
          n=ns.shift()
        }
      }else{
        n=_map.n
        _map=_map.d
      }
      switch(_sign){
        case "+=":return _map[n]+=v;
        case "-=":return _map[n]-=v;
        case "*=":return _map[n]*=v;
        case "/=":return _map[n]/=v;
        case "%=":return _map[n]%=v;
        case "^=":return _map[n]^=v;
        case "&=":return _map[n]&=v;
        case "|=":return _map[n]|=v;
        case "&&=":return _map[n]&&=v;
        case "||=":return _map[n]||=v;
      }
      return _map[n]=v
    }else{
      throw new Error("")
    }

  },
  _getDataMap:function(n,_outMap,_inMap,_defMap){
    if(Object.keys(_inMap).includes(n)){
      return _inMap
    }
    if(Object.keys(_outMap).includes(n)){
      return _outMap
    }
    return _defMap||window
  },
  _buildScopeDataMap:function(_outMap,_inMap){
    let _map=Object.assign({},_outMap)
    _map=Object.assign(_map,_inMap)
    return _map
  },
  _findKeyOuterBlock:function(vs,tk,_start,bs,_noRegex){
    bs=bs||_eval.bd
    let k,b,c,s;
    _init()
    if(vs.push){
      vs=[...vs]
    }
    if(_start){
      vs=vs.push?vs.splice(_start):vs.substring(_start)
    }
    for(let i=0;i<vs.length;i++){
      c=vs[i]
      if(c=="\\"){
        b=!b
      }else if(b){
        b=0
      }else if(!_noRegex&&k=="/"&&c=="/"){
        _init()
        continue
      }else if(!_noRegex&&!k&&c=="/"&&(!s||s.trim().match(/[\(\[\=\?\:]$/))){
        k="/"
        continue
      }else if(k){
        if(k.r==c){
          if(k.n){
            k.n--
          }else{
            _init()
          }
        }else if(k.l==c){
          k.n++
        }
        continue
      }else if(bs[c]){ //([{
        k={l:c,r:bs[c],n:0,p:{k:c}}
      }
      s.push?s.push(c):s+=c;

      let kk=_isKey(s,c)
      if(kk){
        if(vs.pop){
          return {
            e:vs.splice(i+1),
            p:vs.splice(0,i),
            k:kk
          }
        }
        return {
          p:vs.substring(0,i-kk.length+1),
          k:kk,
          e:vs.substring(i+1)
        }
      }
    }

    function _init(){
      k=0
      s=vs.constructor==Array?[]:"";
    }

    function _isKey(s,c){
      if(tk.constructor==Function){
        return tk(s)
      }else if(tk.constructor==RegExp){
        s=s.match(tk)
        return s&&s[0]
      }
      return (tk==s||tk==c)&&tk
    }
  },
  _parseCode:function(v,_case){
    let vs=_eval._parseLine(v)
    if(_case){
      let ss=[]
      vs.forEach(x=>{
        while(1){
          let k=x.match(/^(case|default)(:|\s|\'\"\`\{)/)
          if(k){
            k=k[1]
            x=x.substring(k.length).trim()
            v=_eval._findKeyOuterBlock(x,":")

            if(v.e.match(/^(case|default)(:|\s|\'\"\`\{)/)){
              x=v.e
              ss.push({k:k,v:v.p.trim(),cs:[]})
              continue
            }
            ss.push({k:k,v:v.p.trim(),cs:[v.e]})
          }else if(ss[0]){
            ss[ss.length-1].cs.push(x)
          }
          break
        }
      })
      ss.forEach(x=>{
        x.cs=x.cs.map(y=>_eval._parseItem(y))
      })

      return ss
    }
    vs=vs.map(x=>_eval._parseItem(x))

    return vs
  },
  _parseItem:function(v){
    let ps=[],pps=[],
        b,p,
        c,cc=[],
        s="",_inpp,
        k,kk,inSingle,
        df, //var, let, const
        ok, //for, if, whilte, do, function,switch
        op; //delete, continue, break

    v=v.trim()

    ok=v.match(/^(if|for|while|function|do|try|switch|else +if|else)(\s|\(|\{)/)
    if(ok){
      ok={
        k:ok[1]
      }
      v=v.substring(ok.k.length).trim()
      if(ok.k=="function"){
        ok.n=v.substring(0,v.indexOf("("))
        v=v.substring(ok.n.length)
        ok.n=ok.n.trim()
      }
    }else{
      ok=v.match(/^\(?([^=,\(\)\{\}\[\]]*)\)?=>/)

      if(ok){
        let vv=v.substring(ok[0].length).trim();
        let e=_eval._findKeyOuterBlock(vv,")")
        if(!e){
          v=vv
          if(v[0]!="{"){
            v="return "+v
          }
          ok={
            k:"=>",
            e:_eval._parseItem(ok[1]||" ")
          }
        }else{
          ok=0
        }
      }else{
        let vv=v.match(/^(let|var|const)\s+([^=,\s]+)(\=|\,|$|;)/)
        if(vv){
          v=v.substring(vv[0].length)
          df={
            k:vv[1],
            n:vv[2]
          }
          ps.push(df)
        }else{
          df=v.match(/^([^=\{\[\("'`\!><\s]+\=)[^>=]/);
          if(df){
            v=v.substring(df[1].length)
            df={
              k:"=",
              n:df[1].replace("=","").trim()
            }
            k=df.n.match(/[\+\-\*\/\%\^]$/)
            if(k){
              k=k[0]
              df.k=k+df.k
              df.n=df.n.replace(k,"").trim()
            }
            ps.push(df)
          }else{
            df=v.match(/^(return|delete|throw|typeof|break|continue|new)(\s|$|\[|\{|\()/)||v.match(/^(\.\.\.)/)
            if(df){
              v=v.substring(df[1].length).trim()
              df={
                k:df[1]
              }
              if(["return","break","continue","throw"].includes(df.k)){
                df.c=_eval._parseCode(v)
                return df
              }
              op=df
              ps.push(op)
              df=0
            }else{
              df=v.match(/^(function)(\s|\()/)
              if(df){
                ok={
                  k:df[1]
                }
                v=v.substring(0,df[1].length).trim()
                df=v.match(/^([^\(]+)/)
                if(df){
                  ok.n=df[1].trim()
                  v=v.substring(0,ok.n.length).trim()
                }
              }
            }
          }
        }
      }
    }
    
    for(let i=0;i<v.length;i++){
      c=v[i]
      let p=ps[ps.length-1]
      if(c=="\\"){
        b=!b
      }else if(b){
        b=0
      }else if(kk){
        if(kk==c){
          kk=0
          if(_inpp){
            _inpp=0
            if(s){
              ps.push("+")
              ps.push('"'+s+'"')
            }
            continue
          }
        }else if(kk=="`"&&s.match(/\$\{$/)){
          let ss=_eval._findKeyOuterBlock(v,"}",i)
          if(ss){
            ps.push('"'+s.substring(1,s.length-2)+'"')
            ps.push("+")
            v=_eval._parseItem(ss.p)
            if(v.constructor==Array){
              v=v[0]
            }
            ps.push(v)
            v=ss.e
            i=-1
            _inpp=1
            s=""
            continue
          }
        }
      }else if("`'\"".includes(c)){
        kk=c
      }else if(k=="/"){
        if(c=="["){
          inSingle=1
        }else if(c=="]"){
          inSingle=0
        }else if(inSingle){
        }else if(c=="/"){
          k=0
        }
      }else if(!k&&!ps.length&&c=="/"&&(!s||s.trim().match(/[\(\[\=\?\:]$/))){
        k="/"
      }else if(!s&&(c==" "||c=="\n")){
        continue
      }else if(k){
        if(k.r==c){
          if(k.n){
            k.n--
          }else{
            if(ok){
              if(ok.k=="do"){
                if(ok.c){
                  ok.e=_eval._parseItem(s)
                  return ok
                }else if(s[0]=="{"){
                  ok.c=_eval._parseCode(s.substring(1))
                }else{
                  k=0
                  s+=c
                  continue
                }
              }else if(ok.k=="try"){
                if(!ok.c){
                  ok.c=_eval._parseCode(s)
                }else if(!ok.e){
                  ok.e=_eval._parseItem(s)
                }else if(!ok.ec){
                  ok.ec=_eval._parseCode(s)
                }else{
                  ok.f=_eval._parseCode(s)
                }
                if(i==v.length-1){
                  return ok
                }
                s=""
                k=0
                continue
              }else if(ok.k=="=>"){
                if(k.l=="{"){
                }else{
                  s+=c
                }
                k=0
                continue
              }else if(k.l=="("){
                if(ok.k=="for"){
                  ok.e=_eval._parseCode(s)
                }else{
                  ok.e=_eval._parseItem(s)
                }
                v=v.substring(i+1).trim()
                if(["for","if","else if"].includes(ok.k)){
                  if(v.match(/^\{.*\}$/s)){
                    v=v.substring(1,v.length-1)
                  }
                  ok.c=_eval._parseCode(v,ok.k=="switch")
                  return ok
                }else{
                  if(v.match(/^\{.*\}$/s)){
                    v=v.substring(1,v.length-1)
                    ok.c=_eval._parseCode(v,ok.k=="switch")
                    return ok
                  }
                }
                i=-1
              }else if(ok.k=="function"){
                k=0
                continue
              }else{
                ok.c=_eval._parseCode(s)
                return ok
              }
            }else if(df||op){
              s+=c
              k=0
              continue
            }else{
              k.p.ps=k.l=="{"?_parseObj(s):s?_eval._parseItem(s):[]
              if(k.p.ps.constructor!=Array){
                k.p.ps=[k.p.ps]
              }
            }
            k=0
            s=""
            continue
          }
        }else if(k.l==c){
          k.n++
        }
      }else if(_eval.bd[c]){ //([{
        k={l:c,r:_eval.bd[c],n:0,p:{k:c}}
        s=s.trim()
        if(ok&&ok.k=="do"){
          if(ok.c){
            s=""
            continue
          }
        }else if(ok&&["=>","function"].includes(ok.k)){
          if(s){
            s+=c
          }
          continue
        }else if(df||op){
        }else if(p&&p.cs){
          if(s){
            p.cs.push(s)
            s=""
          }
          k.p.d=1
          p.cs.push(k.p)
          continue
        }else if(s){
          k.p.d=1
          ps.push({
            dd:s,
            cs:[k.p]
          })
          s=""
          continue
        }else{
          ps.push(k.p)
          continue
        }
      }else if(c=="\n"){
        if(!df||op){
          _init()
          continue
        }
      // }else if(c==";"){
      //   if(df){
      //     df.c=_eval._parseItem(s)
      //     s=""
      //     ps.push(..._eval._parseItem(v.substring(i+1)))
      //     ps=ps.filter(x=>x)
      //     ps.forEach(x=>x.k=ps[0].k)
      //     return ps
      //   }else if(op){
      //     op.c=_eval._parseItem(s)
          
      //   }else if(ok&&(ok.k=="=>"||ok.k=="function")){
      //     ok.c=_eval._parseCode(s)
      //     ps.push(ok)
      //     ps.push(..._eval._parseItem(v.substring(i+1)))
      //     return ps
      //   }
      //   _init()
      //   continue
      }else if(c==","){
        if(df){
          df.c=_eval._parseItem(s)
          _parsePartItem(v.substring(i+1),ps)
          ps=ps.filter(x=>x)
          ps.forEach(x=>x.k=ps[0].k)
          return ps
        }else if(op){
          op.c=_eval._parseItem(s)
          _parsePartItem(v.substring(i+1),ps)
          return ps
        }else if(ok&&(ok.k=="=>"||ok.k=="function")){
          ok.c=_eval._parseCode(s)
          ps.push(ok)
          _parsePartItem(v.substring(i+1),ps)
          return ps
        }else if(!s.trim()){
          if(v.substring(0,i).trim().endsWith(",")){
            ps.push([])
          }
          _parsePartItem(v.substring(i+1),ps)
          return ps
        }else{
          s=`(${s})`
          p=_eval._parseItem(s)
          if(p.constructor==Array&&!ps.length){
            ps=p
          }else{
            ps.push(p)
            ps=[ps]
          }
          v=v.substring(i+1)
          while(1){
            let vv=_eval._findKeyOuterBlock(v,",")
            if(vv){
              ps.push(_eval._parseItem(`(${vv.p})`)[0])
              v=vv.e
            }else{
              ps.push(_eval._parseItem(`(${v})`)[0])
              return ps
            }
          }
        }
      }else if(df||ok||op){
      }else if(_eval._isSign(c)){
        if(df||op){
          s+=c
          continue
        }
        _init()
        p=ps[ps.length-1]
        if(!p||p.constructor!=String){
          ps.push(c)
        }else if("~!==+-*/<>&|".includes(p)){
          p+=c
          if(["--","++","==","===","!=","!==","+=","-=","*=","/=","&&","||",">=","<=",">>","<<","^=","&=","|=","!!","%="].includes(p)){
            ps[ps.length-1]=p
          }else{
            ps.push(c)
          }
        }else{
          ps.push(c)
        }
        p=ps[ps.length-1]
        if(v[i+1]!="="&&["=","+=","-=","/=","*=","^=","%=","&=","|=","&&=","||="].includes(p)){
          ps.pop()
          df={
            k:p,
            n:ps.pop()
          }
          ps.push(df)
        }
        continue
      }
      s+=c
    }
    _init()
    if(pps.length){
      if(!pps.includes(ps)){
        pps.push(ps)
      }
      return pps
    }
    if(!ps.length&&ok){
      return ok
    }
    return ps

    function _parsePartItem(v,ps){
      p=_eval._parseItem(v)
      if(!p||p.constructor!=Array){
        p=[p]
      }
      ps.push(...p)
    }

    function _init(){
      s=s.trim()
      if(s){
        if(ok&&ok.k=="do"){
          ok.c=_eval._parseCode(s)
        }else if(ok&&ok.k=="else"){
          if(!ok.c){
            ok.c=_eval._parseItem(s)
            s=""
          }
        }else if(ok&&(ok.k=="=>"||ok.k=="function")){
          ok.c=_eval._parseCode(s)
          ps.push(ok)
        }else if(df){
          df.c=_eval._parseItem(s)
        }else if(op){
          op.c=_eval._parseItem(s)
        }else if(s.match(/^(delete|typeof)\s/)||s.match(/^\.\.\./)){
          ps.push(_eval._parseItem(s))
        }else if(s.match(/^\./)){
          if(ps.length&&ps[ps.length-1].ps){
            ps[ps.length-1].ps.push(s)
          }else{
            ps.push(s)
          }
        }else{
          ps.push(s)
        }
        s=""
      }
    }

    function _parseObj(o){
      let d={},k,s="",b,ks=[],l;
      o=o.trim()
      if(!o){
        return d
      }
      for(let i=0;i<o.length;i++){
        let c=o[i]
        if(b){
        }else if(c=="\\"){
          b=!b
          continue
        }else if(!k){
          if(!ks.length&&c==":"){
            if(s=="null"){
              k=[null]
            }else if(s=="undefined"){
              k=[undefined]
            }else if(s=="false"){
              k=[false]
            }else if(s=="true"){
              k=[true]
            }else{
              s=s.trim().replace(/^['"]|['"]$/g,"")
              k=[s]
            }
            s=""
            continue
          }
        }else if(!s&&c.match(/\s/)){
          continue
        }else if(c==ks[0]){
          ks.shift()
        }else if("\"'`".includes(ks[0])){
        }else if("({['\"`".includes(c)){
          ks.unshift(_eval.bd[c])
        }else if(c==","&&!ks.length){
          d[k[0]]=_eval._parseItem(s)
          k=""
          s=""
          continue
        }
        s+=c
      }
      if(s){
        d[k[0]]=_eval._parseItem(s)
      }
      return d
    }
  },
  _parseLine:function(v){
    let s="",ps=[],b,k,kk,_endExpress=[],_comment,_inDo,_oneLine=[];
    v=v.trim()

    for(let i=0;i<v.length;i++){
      let c=v[i]

      if(_comment=="/"+"/"){
        if(c=="\n"){
          _comment=0
        }else{
          continue
        }
      }else if(_comment=="/"+"*"){
        if(c=="/"&&v[i-1]=="*"){
          _comment=0
        }
        continue
      }
      if(!s&&c.match(/\s/)){
        continue
      }else if(c=="\\"){
        b=!b
      }else if(b){
        b=0
      }else if(kk){
        if(kk==c){
          kk=0
        }
      }else if("`'\"".includes(c)){
        kk=c
      }else if(k=="/"&&c=="/"){
        k=0
      }else if(!k&&c=="/"&&s.trim().match(/[\(\[\=\?\:]$/)){
        k="/"
      }else if(c==" "&&("+-*/([{%!\?\:".includes(v[i+1])||s.match(/([\s\(\{\[\+\-\*\?\:\/\%\&\|\^\~])$/))){
        continue
      }else if((c=="/"||c=="*")&&s.match(/[^\\]\/$/)){
        _comment="/"+c
        s=s.replace(/[\/]$/,"")
        continue
      }else if(k){
        if(k.r==c){
          if(k.n){
            k.n--
          }else{
            if(_endExpress[0]&&s.includes(_endExpress[0])&&s.substring(_endExpress[0].length).trim()[0]!="{"){
            }else if(k.l=="{"){
              if(s.match(/^(for|if|while|switch|function|else|do|try)[\s\(\{]/)){
                s+=c
                if(!s.match(/^(do|try)/)){
                  _init()
                }
                k=0
                continue
              }
            }else if(k.l=="("&&s.match(/^(if|for|while|switch|function|else if)[\s|\(]/)){
              _endExpress.unshift(s+")")
              let vv=v.substring(i+1).trim();
              if(vv.match(/^(for|if|while|do|try)(\s|\{|\(|$)/)){
                v=vv
                i=-1
                _oneLine.push(_endExpress[0])
                _endExpress=[]
                s=""
                continue
              }
            }
            k=0
          }
        }else if(k.l==c){
          k.n++
        }else if(c.match(/\s/)){
          let vr=v.substring(i+1).trim(),
              vl=v.substring(0,i)
          if(_uselessSpace(vr,vl,c)){
            continue
          }
        }
      }else if(c=="\n"){
        if((_endExpress[0]||"").replace(/ /g,"")==(s||"").replace(/ /g,"")){
          continue
        }
        s=s.trim()
        if(s.match(/^do([\s\{]|$)/)&&!_inDo){
          if(!s.match(/^do\s*\{.+while.+\)/s)){
            s+=c
            _inDo=1
          }else{
            _init()
          }
          continue
        }


        let vr=v.substring(i+1).trim(),
            vl=v.substring(0,i)
        if(_uselessSpace(vr,vl,c)){
          continue
        }
        if(_inDo==1){
          if(!vr.match(/^while(\s|\()/)){
            _inDo=0
            _init()
          }else{
            s+=c
          }
          continue
        }
        if(vl.endsWith("}")&&vr.match(/^(catch|while)(\s|\()/)){
          continue
        }else if(s.trim()=="else"){
          s="else "
          continue
        }
        _init()
        continue
      }else if(c==";"){
        let vr=v.substring(i+1).trim()
        if((!_inDo||!vr.match(/^while(\s|\()/))&&_endExpress[0]!=s){
          ps.push(s.trim())
          s=""
          _init()
          continue
        }
      }else if(_eval.bd[c]){
        s=s.trim()
        k={l:c,r:_eval.bd[c],n:0}
      }
      s+=c
    }
    _init()
    return ps

    function _uselessSpace(vr,vl,c){
      if(vl.match(/([^-]-|[^+]\+|[^\/]\/|[\*=~!&\|\^%><?:,;\.\(\[\{])$/)||vr.match(/^(-[^-]|\!\=|\+[^+]|\/[^\/\*]|[\*%\^&|=><?:,;\.\(\)\[\]\}])/)||vl.match(/([\+][\+][\+]|---)$/)){
        return 1
      }else if(vr[0]=="{"){
        return c!="\n"
      }
    }

    function _init(){
      s=s.trim()
      if(_oneLine.length){
        s=_oneLine.join(" ")+s
        _oneLine=[]
      }
      if(s){
        ps.push(s)
        s=""
      }
      _endExpress.shift()
      _inDo=0
    }
  },
  /**/
  _chkParameter:function(){
    let vs=[]
    for(let i=0;i<arguments.length;i++){
      vs.push(arguments[i])
    }
    return vs
  },
  _testCode:function(_simpleExe,_repeat){
    let vs=[
      {c:`let a=/[a-z]+\\/[0-9]+/ig,b="89a/999B/3d2c/4";b.match(a)`,r:['a/999', 'B/3', 'c/4']},
      {c:"!1+2*3+(~4+5)/3*6+7%2+3^4+!!2<<2+3>>2",r:34},
      {c:"1<2*3&&(4+5)/3*6+7%2>3^4+2<<2+3>>2",r:49},
      {c:"let a=1;!a",r:false},
      {c:"let a=1;~a+5",r:3},
      {c:"_IDE._data._curTest._data.name",r:"demo"},
      {c:"_IDE._data._curTest._data.name+(9+6)*10+'px'",r:"demo150px"},
      {c:"_IDE._data._curTest._data.name+(9+6)*10+1",r:"demo1501"},
      {c:"[1,2,3,null,undefined,0]",r:[1,2,3,null,undefined,0]},
      {c:"({a:2}).a",r:2},
      {c:"[1,2,3][0]",r:1},
      {c:"_Util._replaceAll('lws','w','ok')",r:"loks"},
      {c:"_Util._replaceAll('lws','w','ok')[2]",r:"k"},
      {c:"_ideTestManagement._getStdDescription(_IDE._data._curTest)",r:"[m5.t4] demo"},
      {c:"_ideTestManagement._getStdDescription(_IDE._data._curTest)+' '+_ideTestManagement._getStdDescription(_IDE._data._curTest)",r:"[m5.t4] demo [m5.t4] demo"},
      {c:"_ideTestManagement._getStdDescription(_IDE._data._curTest).length+10*10",r:112},
      {c:"_eval._chkParameter(0)",r:[0]},
      {c:"_eval._chkParameter(undefined)",r:[undefined]},
      {c:"_eval._chkParameter()",r:[]},
      {c:"_eval._chkParameter(1,2,3)",r:[1,2,3]},
      {c:"_eval._chkParameter({})",r:[{}]},
      {c:"[]",r:[]},
      {c:"[0]",r:[0]},
      {c:"[undefined]",r:[undefined]},
      {c:"0",r:0},
      {c:"0.1",r:0.1},
      {c:"''",r:""},
      {c:"undefined",r:undefined},
      {c:"null",r:null},
      {c:"true",r:true},
      {c:"false",r:false},
      {c:`let a=true
        if(a){
          a=11
        }
      `,r:11},
      {c:"(1,2,3)",r:3},
      {c:"let a=3;a*_IDE._data._curTest._data.actions.length;",r:6},
      {c:`let a="lws",b="w",c=3;_Util._replaceAll(a,b,c)+5`,r:"l3s5"},
      {c:`let a={a:3},b=3,c=5;b=3+delete a.a+5,b`,r:9},
      {c:`let a={a:3},b=3,c=5;b=3+typeof a.a+5,b`,r:"3number5"},
      {
        c:`let a=1
        if(a){
          a=3
        }`,
        r:3
      },
      {
        c:`let a=1
        for (let i = 0; i < 10; i++) {
            a+=1
        }`,
        r:11
      },
      {
        c:`let a=1
        for (let i = 0; i < 10; i++) 
            a+=1
        `,
        r:11
      },
      {
        c:`let a=1,i=0
        do{
            a+=7
            i++
        }while(a<100)`,
        r:14
      },
      {
        c:`let a=1
        do
            a+=7
        while(a<100)`,
        r:106
      },
      {
        c:`
        let a=2,b=3;
        if(a){
          let b=222
          a+=b
        }
        `,
        r:224
      },
      {
        c:`
        let a=2,b=3;
        if(a)
          a+=b
        `,
        r:5
      },
      {
        c:`let a=3,b=34;
        lws(3,a,b)+lws(3,b,a)
        function lws(v,a,b) {
          if(a>b){
            a+=1
          }else{
            a+=b
          }
          return v+2+a*b
        }
        `,
        r:1373
      },
      {
        c:`let a=3,b=34;
        lws(3,a,b)+lws(3,b,a)
        function lws(v,a,b) {
          if(a>b)
            a+=1
          else
            a+=b
          
          return v+2+a*b
        }
        `,
        r:1373
      },
      {
        c:`let a=3,b=34;
        lws(function(x){return x*10},a,b)
        function lws(v,a,b) {
          if(a>b){
            a+=1
          }else{
            a+=b
          }
          v=v(a)
          return v+2+a*b
        }`,
        r:1630
      },
      {
        c:`let a=3,b=34;
        lws(x=>x*10,a,b)
        function lws(v,a,b) {
          if(a>b){
            a+=1
          }else{
            a+=b
          }
          v=v(a)
          return v+2+a*b
        }
        `,
        r:1630
      },
      {
        c:`let a=3,b=34;
        lws((x)=>x*10,a,b)
        function lws(v,a,b) {
          if(a>b){
            a+=1
          }else{
            a+=b
          }
          v=v(a)
          return v+2+a*b
        }
        `,
        r:1630
      },
      {
        c:`let a=3,b=34;
        lws(()=>10,a,b)
        function lws(v,a,b) {
          if(a>b){
            a+=1
          }else{
            a+=b
          }
          v=v(a)
          return v+2+a*b
        }
        `,
        r:1270
      },
      {
        c:`let lws=function(x){return x+9};lws(3)`,
        r:12
      // },
      // {
      //   c:`let lws=${_Util._replaceAll.toString()};lws(_eval._testCode.toString(),"a","999")`
      },
      {
        c:`b={c:33,d:334},a={a:function(){
          return b
        }}
        delete a.a().c
        b`,
        r:{d:334}
      },
      {c:"let a=[1,2,3];[a][0][1]",r:2},
      {c:"let a={a:3},b=3,c=5;b=[3+delete a.a+5,b,a];b",r:[9, 3, {}]},
      {c:"let a={a:3},b=3,c=5;b=[3+typeof a.a+5,b,a];b",r:["3number5", 3, {a:3}]},
      {c:`let a=function(){
              arguments[1]+=100;
              return [...arguments]
          }
          a(1,2,3)`,r:[1,102,3]
      },
      {c:"let a=new Date();a.getTime()>100",r:true},
      {
        c:`
        let i,j=10;
        for(i=0;i<10;i++){
          j++
          if(i>3){
            if(i){
               continue
            }
          }
          j++
        }
        j`,
        r:24
      },
      {
        c:`
        let i,j=10;
        for(i=0;i<10;i++){
          j++
          if(i>3){
            if(i){
               break
            }
          }
          j++
        }
        j`,
        r:19
      },
      {
        c:`let a=function(){
            let msg;
            try{
                let a=2;
            if(a){
              throw new Error("lws")
            }
                return 1
            }catch(ex){
                msg=ex.message
            }finally{
                return msg+3
            }
          }
          a()`,
        r:"lws3"
      },
      {
        c:`let a={
          v:"lws",
          a:function(v){
            return v+this.v+this.b(3)
          },
          b:function(v){
            return v*10
          }
        }
        a.a(10)`,
        r:"10lws30"
      },
      {
        c:`[0,1,2].filter(x=>x).map(x=>x*12)`,
        r:[12, 24]
      },
      {
        c:`let lws=function(a){
          let c;
          switch(a){
          case 1:c="+";break;
          case 2:c="-";break;
          case 3:
          case 4:c="*";break;
          default:c="%"
          }
          return eval(10+c+3)
          };
          ([0,1,2,3,4]).map(x=>lws(x))`,
        r:[1, 13, 7, 30, 30]
      },
      {
        c:`a=1,b=0;if(a)for(;a<10;a++)
        b+=3
        b`,
        r:27
      },
      {
        c:"(v=>v+1)(1)",
        r:2
      },
      {
        c:`[lws(10),lws(9),lws(2),lws(7)]
        function lws(v) {
            return v%2?v%3?11:21:v%5?111:112
        }`,
        r:[112, 21, 111, 11]
      },
      {
        c:`\`lws-\${_Util._replaceAll(name,'bz','123')}\``,
        r:"lws-123-master"
      },
      {
        c:"new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(22);",
        r:"$22.00"
      }
    ]
    let t=Date.now()
    if(!_simpleExe){
      vs.push(
        {
          c:`let a={a:3,b:3}
          debugger
  
          delete a.a
          a
          `,
          r:{b:3}
        },
        {c:"{a:33,b:'lws',c:{d:\"aa\",'e':[33,334,34],f:true,g:false}}",r:{a:33,b:'lws',c:{d:"aa",'e':[33,334,34],f:true,g:false}}},
        {c:"{a:0,b:undefined,c:null,'':1,null:2,undefined:2}",r:{a:0,b:undefined,c:null,'':1,null:2,undefined:2}}
      )
    }else if(_simpleExe=="bz"){
      vs.forEach(x=>x.c=_eval._parseCode(x.c))
      t=Date.now()
    }
    _repeat=_repeat||1
    for(let j=0;j<_repeat;j++){
      let v=vs.forEach(x=>{
        try{
          if(_simpleExe=="js"){
            eval(x.c)
          }else{
            let c=JSON.stringify(_eval._exeCode(x.c))
            if(!_simpleExe&&_repeat<2){
              if(c!=JSON.stringify(x.r)){
                console.log("Failed on:"+x.c+" ==> "+c)
                return 1
              }
            }else{

            }
          }
        }catch(ex){
          console.log("Get Error: "+ex.message+"\n\n"+x.c)
        }
      })
    }
    console.log("Spent time: "+(Date.now()-t))
  }
};window._Util={
  _attrRegex:/\[(.+)\=('|)(\$label|\$header)('|)\]/,
  _bzJQFun:/\:(near|input|data|panel|Contains|textElement|after|before|endContains|contains|endEqual|equal|RowCol|rowcol|text)\((\$label|\$header)\)/,
  _allLetterAndNumber:/[\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC]+/,
  _allPrintableChr:/[\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC !"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]+/,
  _allSign:/[^\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC]+/,
  _jsNameRegex:/[\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC\_\$]/,
  _jsData:/([\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC\_\$]+|\.|\[\"|\[\'|\'\]|\"\])+/g,
  _matchAllLetterAndNumber:/[\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC]+/g,
  _matchAllSign:/[^\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC]+/g,
  _trimSign:/(^[^\(\[\{\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC]+|[^\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC\)\]\}]+$)/g,
  _dataRegex:/(((\$(project|module|test|loop|data|group|action|parameter)((\.|\[|$)([a-zA-Z0-9\u4E00-\u9FCC_\$\'\"\(\)]+[\.|\[|\]]*)*)*|(\'|\").*(\'|\"))+( *(\+|\-|\*|\/) *)*)+)/g,
  _eval:function(v,_map){
    if(_eval._isBzData(v)||bzTwComm._isExtension()){
      return _eval._exeCode(v,_map)
    }else{
      _map=_map||{}
      let ks=Object.keys(_map)
      for(let i=0;i<ks.length;i++){
          let k=ks[i]
          eval("var "+k+"=_map."+k)
      }
  
      return eval(v)
    }
  },
  _isAPISucessStatus:function(v){
    return v&&v<400
  },
  _parseToExeCode:function(d,_toFunOnly){
    d=(d||"").trim()
    if(_Util._isFunction(d)){
      if(d.match(/\)$/)){
        return d
      }
    }else{
      d=d.split("\n")
      if(d.length==1){
        d=`()=>{\n  return ${d[0]}\n}`
      }else{
        d=`()=>{\n${d.map(x=>"  "+x).join("\n")}\n}`
      }
    }

    if(!_toFunOnly){
      d=`(${d})()`
    }
    return d
  },
  _isFileData:function(v){
    try{
      if(v && v.constructor==String){
        v=_Util._eval("v="+v);
        v=v[0]
      }
      return v.base64Link
    }catch(e){}
  },
  _isRegexData:function(s){
    if(s && s.constructor==String){
      return !!s.match(/^[\/](.+)[\/][igs]*$/)
    }
  },
  _joinMessage:function(a){
    a=[...a]
    a=a.filter(x=>x)
    let v=a.pop()
    a=a.join(", ")
    if(a){
      return _Util._formatMessage(_bzMessage._common._andMessage,[a,v])
    }
    return v
  },
  _log:function(){
    let ps=[]
    for(var i=0;i<arguments.length;i++){
      let v=arguments[i]
      if([Object,Array].includes(v.constructor)){
        v=JSON.stringify(v,0,2)
      }
      ps.push(v+"")
    }
    let p=ps.shift()
    if(p.match(/\{[0-9]\}/)){
      p=_Util._formatMessage(p,ps)
    }else{
      ps.unshift(p)
      p=ps.join("\n")
    }
    if(!bzTwComm._isIDE()){
      bzTwComm._postToIDE({_scope:"_Util",_fun:"_log",_args:[p]});
      return p
    }
    if(p.startsWith("video-img:")){
      if(!BZ._isPlaying()){
        return
      }
    }else if(p.includes("miss-element-screenshot-md5")){
      _ideTask._setLastScreenshotMd5(p.split(":")[1].trim())
    }
    console.log("BZ-LOG: "+p)
    if(p&&p.length>1000&&BZ._isAutoRunning()){
      console.clear()
    }
    return p
  },
  _highlightKeywordsInHTML:function(w,k,_match){
    k=(k||"").trim()
    if(!k){
      return "<div></div>"
    }

    if(_match){
      let g=_Util._eval(_match._regex+"g"),
      s=_Util._eval(_match._regex)
      w=w.split("\n")
      w=w.map(x=>{
        let xx=x.match(g)
        x=x.replace(g,"\n").split("\n")
        return x.map((z,i)=>{
          let n=0
          if(!i){
            n=1
          }else if(x[i+1]){
            n=2
          }
          z=_Util._getStringBySize(z,30,n);
          if(xx[i]){
            let vs=xx[i].match(s)
            return z+xx[i].replace(vs[_match._idx],`<span class='bz-search-word'>${vs[_match._idx]}</span>`)
          }else{
            return z
          }
        }).join("")
      }).join("\n")
    }else{
      var fw=w.toLowerCase(),
          fd=k.toLowerCase().split(" ")
      let ws=[{w:w,fw:fw}]

      fd.forEach(y=>{
        let x=ws[ws.length-1]
        let ww=x.fw.indexOf(y)
        if(ww>=0){
          let nw=x.w.substring(ww+y.length)
          let nfw=x.fw.substring(ww+y.length)
          x.w=x.w.substring(0,ww)
          x.fw=x.fw.substring(0,ww)
          ws.push({k:y})
          ws.push({w:nw,fw:nfw})
        }
      })

      w=ws.map((x,i)=>{
        if(x.w){
          if(!i){
            i=1
          }else if(ws[i+1]){
            i=2
          }else{
            i=0
          }
          return _Util._getStringBySize(x.w,30,i)
        }else if(x.k){
          return `<span class="bz-search-word">${x.k}</span>`
        }
      }).join("")
    }
    return `<div>${w}</div>`
  },
  _waitElement:function(e,_fun){
    if($(e)[0]){
      return _fun($(e)[0])
    }
    setTimeout(()=>{
      _Util._waitElement(e,_fun)
    },100)
  },
  _findLabel:function(f,v,_removeSign){
    let o=_cssHandler._findNodeByTxt(f,v,_removeSign);

    let os=$(f).find(":hidden").toArray()
    os.forEach(x=>{
      x=_cssHandler._findNodeByTxt(x,v,_removeSign);
      if(x.length){
        o.push(...x)
      }
    })

    if(o.length>1){
      o.sort((a,b)=>{
        return a.w.length-b.w.length
      })
      if(o[1].w.length>o[0].w.length){
        return [o[0]]
      }
      let oo=o.filter(x=>{
        if(x.e.tagName=="LABEL"){
          return 1
        }else if(x.e.parentElement&&x.e.parentElement.tagName=="LABEL"){
          let p=x.e.parentElement
          if(p.children.length>1){
            for(let n of p.children){
              if(n!=x.e){
                if(_cssHandler._lookLikeInput(x.e,n)){
                  x.ks.push(n)
                }
              }
            }
          }
          x.e=p
          return 1
        }
      });
      if(oo.length){
        o=oo
      }
    }
    if(o.length>1&&!v.includes("|")){
      o.sort((a,b)=>a.w.length-b.w.length)
      o=o.filter(x=>x.w.length==o[0].w.length)
    }
    
    o.forEach(x=>{
      while(x.e.tagName!="LABEL"&&x.e.parentElement.children.length==1&&!x.ks.length){
        x.e=x.e.parentElement
      }
    })
    
    return o
  },
  _afterAppReady:function(_fun,_chkElement){
    if(!document.body.innerText){
      return setTimeout(()=>{
        _Util._afterAppReady(_fun)
      },100)
    }
    if($.isNumeric(_domActionTask._getLoadingFun())){
      return setTimeout(()=>{
        _Util._afterAppReady(_fun)
      },10)
    }
    _domActionTask._isLoading(function(){
      _chk(_chkElement,0)
    })
    function _chk(e,i){
      if(e&&!$util.findDom(e)){
        if(i>20){
          _fun()
        }else{
          setTimeout(()=>{
            _chk(e,i+1)
          },100)
        }
      }else{
        _fun()
      }
    }
  },
  _getInputValue:function(o){
    let v=o.value
    if(["INPUT","SELECT","TEXTAREA"].includes(o.tagName)){
      if(o.type=="radio"){
        v=$("input[name="+o.name+"]").val()
      }else if(o.type=="checkbox"){
        v=o.checked
      }
    }else{
      v=$util.getElementText(o)
    }
    return v
  },
  _getTargetElement:function(os){
    os=os.toArray?os.toArray():os;
    let i=1
    while(os.length>i){
      if($(os[i-1]).find(os[i])[0]){
        os.splice(i-1,1)
      }else{
        i++
      }
    }
    return os
  },
  _testPerformance:function(_fun){
    let t=Date.now()
    _fun()
    console.log(Date.now()-t)
  },
  _getDataKeyMap:function(d){
    let m={};
    for(let k in d){
      let kk=_Util._toCamelWords(_Util._toSingularWord(_Util._parseCamelWords(_Util._toCamelWords(k))))
      m[kk]=k
    }
    return m
  },
  _isInMenu:function(o,p){
    while(!$(o).find(p)[0]){
      if(["fixed","absolute"].includes($(o).css("position"))){
        return 1
      }
      o=o.parentElement
    }
  },
  _getDiffWords:function(w1,w2,_splitRegex,_inSensitive,_noIgnoreNumber){
    w1=_initWordds(w1)
    w2=_initWordds(w2)
    let ds=[],ws1=w1.length,ws2=w2.length
    _chkEnd(w1,w2)
    while(w1.length&&w2.length){
      let p1=w1.shift(),
          p2=w2.shift()
      if(p1!=p2){
        let i1=w1.indexOf(p2),
            i2=w2.indexOf(p1)
        if(i1==-1){
          ds.push(p2)
          if(i2==-1){
            ds.push(p1)
          }else{
            w1.unshift(p1)
          }
        }else if(i2==-1){
          ds.push(p1)
          w2.unshift(p2)
        }else if(w1.length-i1>w2.length-i2){
          w2.unshift(p2)
          ds.push(p1)
        }else if(w1.length-i1<w2.length-i2){
          w1.unshift(p1)
          ds.push(p2)
        }else if(w1.length>w2.length){
          ds.push(p1)
          w2.unshift(p2)
        }else if(w1.length<w2.length){
          ds.push(p2)
          w1.unshift(p1)
        }else{
          ds.push(p1,p2)
        }
      }
    }
    ds.push(...w1)
    ds.push(...w2)
    return {ds:ds,p1:ds.length/ws1,p2:ds.length/ws2}
    
    function _chkEnd(_pop){
      while(w1.length&&w2.length){
        let p1=w1.pop(),
            p2=w2.pop()
        if(p1!=p2){
          w1.push(p1)
          w2.push(p2)
          return
        }
      }
    }
    
    function _initWordds(w){
      if(_inSensitive){
        w=w.toLowerCase()
      }
      if(!_noIgnoreNumber){
        w=w.replace(/[0-9]/g,"")
      }
      w=w.replace(_splitRegex||/ +/g," ").split(" ").filter(x=>x)
      return w
    }
  },
  _isSameElement:function(a,b,_simple){
    if(a==b){
      return 1
    }else if(!_Util._isHidden(a)&&!_Util._isHidden(b)){
      return
    }
    if(a.tagName==b.tagName&&a.type==b.type&&a.innerText==b.innerText){
      if(a.parentElement&&b.parentElement&&!a.innerText){
        if(!_Util._isSameElement(a.parentElement,b.parentElement,_simple)){
          return
        }
      }
      if(_simple){
        return 1
      }
      let d=0,s=0;
      for(let k in a.attributes){
        let av=k.value,
            bv=b.attributes[k.name];
        if(av!=bv){
          if(av&&bv){
            av=av.replace(/[0-9 ]/g,"")
            bv=bv.replace(/[0-9 ]/g,"")
            if(av!=bv){
              d++
              continue
            }
          }else if(k.name!="value"){
            d++
            continue
          }
        }
        s++
      }
      return d==0||s>d
    }
  },
  _filterEndElementList:function(_list){
    let n=0
    for(let i=n+1;i<_list.length;i++){
      let io=_list[i],no=_list[n]
      if(io.tagName!=no.tagName){
        if($(io).find(no).length){
          _list.splice(i--,1)
        }else if($(no).find(io).length){
          _list.splice(n,1)
          i--
        }
      }
    }
  },
  _drawArrow:function(c,x1,y1,x2,y2,_headlen,z){
    _headlen=_headlen||10;
    z=z||1
    var _angle = Math.atan2(y2-y1,x2-x1);
    c.moveTo(x1,y1);
    c.lineTo(x2,y2);
    c.moveTo(x2-_headlen*Math.cos(_angle-Math.PI/6)*z,y2-_headlen*Math.sin(_angle-Math.PI/6)*z);
    c.lineTo(x2,y2);
    c.lineTo(x2-_headlen*Math.cos(_angle+Math.PI/6)*z,y2-_headlen*Math.sin(_angle+Math.PI/6)*z);
    c.stroke();
  },
  _showLargeImgOnMouseover:function(o){
    o._overTime=setTimeout(()=>{
      let s=o.style;
      if(o.clicked){
        o.clicked=0
        return
      }
      if(s.position!="absolute"){
        s.position="absolute";
        let r=o.getBoundingClientRect();
        if(r.right>window.innerWidth){
          s.right="10px"
        }else if(r.left>50){
          s.marginLeft="-40px";
        }

        let c=document.createElement("div")
        document.body.append(c)
        c.style="background-color: transparent;z-index: 2147483647;position: fixed;top: 0;left: 0;width: 100%;height: 100%;"
        c.onclick=function(){
          s.position=s.marginLeft=s.right="";
          c.remove();
          o.clicked=Date.now()
          setTimeout(()=>{
            o.clicked=0
          },500)
        }
      }
    },300)
  },
  _getListSum:function(_list){
    if(_list.length){
      return _list.reduce((a,b)=>a+b)
    }
    return 0
  },
  _getListAvg:function(_list){
    if(_list.length){
      return _list.reduce((a,b)=>a+b)/_list.length
    }
    return 0
  },
  _toSingularWord:function(w){
    w=w||""
    w=w.trim().plural().replace(/\s+/g," ").split(" ")
    return w.map(x=>x.plural(1)).join(" ")
  },
  _getPageRootNode:function(){
    let o=document.body.parentElement,os=[]
    for(let x of o.children){
      if(!_Util._isHidden(x)){
        os.push(x)
      }
    }
    return os
  },
  _getSysObj:function(k){
    let d=window
    let ks=k.split(".")
    ks.forEach(x=>{
      d=d[x]
    })

    return d
  },
  _setSysObj:function(k,v){
    let ks=k.split(".")
    k=ks.pop()
    let d=window
    if(ks[0]){
      if(!d[ks[0]]){
        return setTimeout(()=>{
          console.log("Delay set data")
          _Util._setSysObj(k,v)
        },100)
      }
    }
    ks.forEach(x=>{
      d=d[x]
    })
    d[k]=v
  },
  _assign:function(f,t,ks){
    for(let k in f){
      if(!ks||ks.includes(k)){
        t[k]=f[k]
      }
    }
  },
  _overwriteObj:function(c,n){
    $.extend(true,c,n);
    _cleanData(c,n)
    function _cleanData(c,n){
      for(let k in c){
        if(n[k]===undefined){
          delete c[k]
        }else if(n[k].constructor==Object){
          _cleanData(c[k],n[k])
        }
      }
    }
  },
  _getEllipsisText:function(d,s){
    if(d){
      s=s||100
      if([Array,Object].includes(d.constructor)){
        d=JSON.stringify(d)
      }
      if(d.length>s){
        d=d.substring(0,s)+" ..."
      }
    }
    return d
  },
  _toErgodicList:function(o){
    let _list=[],d={}
    if(_Util._isEmpty(o)){
      return _list[o]
    }
    for(let k in o){
      let vs=o[k],_tmpList=_list
      _list=[]
      if(!vs||vs.constructor!=Array){
        vs=[vs]
      }
      let _init=!_tmpList.length
      vs.forEach(x=>{
        if(_init){
          d={}
          d[k]=x
          _tmpList.push(d)
        }else{
          _tmpList.forEach(y=>{
            y[k]=x
          })
          _list=_list.concat(_tmpList)
          _tmpList=_Util._clone(_tmpList)
        }
      })
      if(_init){
        _list=_tmpList
      }
    }
    return _list
  },
  _getDataByPath:function(d,p){
    p=p.split(".")
    p.find(x=>{
      try{
        d=d[x]
      }catch(e){
        d=undefined
        return 1
      }
    })
    return d
  },
  _setDataByPath:function(d,p,v,_initOnly){
    p=p.split(".")
    while(p.length){
      let k=p.shift()
      if(p.length){
        if(d[k]===undefined){
          if($.isNumeric(p[0])){
            d[k]=[]
          }else{
            d[k]={}
          }
        }
        d=d[k]
      }else{
        if(_initOnly){
          if(d[k]===undefined){
            d[k]=v
          }
        }else{
          d[k]=v
          if(d.list){
            d.list.find((x,i)=>{
              if(x==v){
                d.list.splice(i,1)
                return 1
              }
            })
            d.list.unshift(v)
          }
        }
      }
    }
    p.find((x,i)=>{
      try{
        if(d[x]===undefined){
          
        }
        d=d[x]
      }catch(e){
        d=undefined
        return 1
      }
    })
    return d
  },
  _generateNewName:function(n){
    let nn=n.match(/(.+)\(?([0-9]+)\)?$/)
    if(nn){
      n=nn[1].replace(/\($/,"")
      nn=parseInt(nn[2])+1
    }else{
      nn=1
    }
    return n+"("+nn+")"
  },
  _getSameTextDom:function(os,w){
    if(os.length<2){
      return os
    }
    let vs=[],ws=[]
    w=w.replace(/\s+/g," ").toLowerCase().trim()
    os.forEach(x=>{
      ws.push(x.innerText.replace(/\s+/g," ").toLowerCase().trim())
    })
    ws.forEach((x,i)=>{
      if(x==w){
        vs.push(os[i])
      }
    })
    if(vs.length){
      return vs
    }
    
    ws.forEach((x,i)=>{
      if(x.includes(w)){
        vs.push(os[i])
      }
    })
    if(vs.length){
      return vs
    }
    return vs
  },
  _getCeilDom:function(_list){
    let os=[],_last
    while(_list.length){
      let o=_list.pop()
      if(_last){
        if(!$(o).find(_last)[0]){
          os.unshift(o)
        }
      }else{
        os.unshift(o)
      }
      _last=o
    }
    return os
  },
  _queryToObj:function(_url){
    if(_url){
      _url=_url.split("?")[1]
      if(_url){
        _url=_url.split("#")[0]
        if(_url){
          _url=_url.split("&")
          let v={}
          _url.forEach(x=>{
            x=x.split("=")
            if(x[1]){
              x[1]=decodeURIComponent(x[1])
            }
            v[x[0]]=x[1]
          })
          return v
        }
      }
    }
  },
  _randomList:function(ts){
    ts.forEach((x,i)=>{
      ts.splice(i,1)
      if(Math.random()>0.5){
        ts.unshift(x)
      }else{
        ts.push(x)
      }
    })
  },
  _isBlankIFrame:function(x){
    try{
      return x.contentWindow.location.href=="about:blank"||x.contentWindow.location.href==location.href
    }catch(e){}
  },
  //JSON style but include ref-data, like: $test.name ...
  _isSameMissJSON:function(v1,v2){
    v1=v1.replace(/ *\: */g,":")
    let s1=v1.match(/\:\"[^\"]+\"/g)
    let s2=v2.match(/\:\"[^\"]+\"/g)
    if(s1==s2){
    }else if(!s1||!s2){
      return
    }else{
      s1=s1.sort().join("\t")
      s2=s2.sort().join("\t")
      if(s1!=s2){
        return
      }
    }
    s1=v1.replace(/\:\"[^\"]+\"/g,":")
    s2=v2.replace(/\:\"[^\"]+\"/g,":")
    v1=s1
    v2=s2

    s1=v1.match(/[^\{\,]+\:/g)
    s2=v2.match(/[^\{\,]+\:/g)
    
    if(s1==s2){
    }else if(!s1||!s2){
      return
    }else{
      s1=s1.map(x=>{return x.trim().replace(/\"/g,"")}).sort().join("\t")
      s2=s2.map(x=>{return x.trim().replace(/\"/g,"")}).sort().join("\t")
      if(s1!=s2){
        return
      }
    }
    s1=v1.replace(/[^\{\,]+\:/g,"").replace(/[\{\}]/g,"").replace(/\s/g,"").split(",").sort().join(",")
    s2=v2.replace(/[^\{\,]+\:/g,"").replace(/[\{\}]/g,"").replace(/\s/g,"").split(",").sort().join(",")
    return s1==s2
  },
  //atob
  _b64DecodeUnicode:function(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    try{
      return atob(str)
    }catch(e){
      return decodeURIComponent(atob(str).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    }
  },
  //btoa
  _b64EncodeUnicode:function (str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    try{
      return btoa(str)
    }catch(e){
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
          function toSolidBytes(match, p1) {
              return String.fromCharCode('0x' + p1);
      }));
    }
  },
  _t36String:"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  _to36:function(v){
    let i=_Util._t36String.length
    let x=_Util._t36String[v%i]
    v=Math.round(v/i)||""
    if(v){
      v=_Util._to36(v)
    }
    return v+x
  },
  _t62String:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  _to62:function(v){
    let i=_Util._t62String.length
    let x=_Util._t62String[v%i]
    v=Math.round(v/i)||""
    if(v){
      v=_Util._to62(v)
    }
    return v+x
  },
  _formatJQSelection:function(v){
    if(v&&"#.".includes(v[0])){
      v=v[0]+v.substring(1).replace(/([^0-9a-z-_])/gi,"\\$1")
    }
    return v
  },
  //update css before/after 
  _updateCssContent:function(k,v){
    document.styleSheets[0]&&(document.styleSheets[0].addRule(k,v))
  },
  //For check _bzMessage data
  _getKeyList:function(d,p,w){
    w=w||[],p=p||""
    for(let k in d){
      w.push(k)
      if(d[k].constructor==Object){
        _getKeyList(d[k],p+"  ")
      }
    }
    return w
  },
  _getJSONErrorPosition:function(v,_startLine){
    v=v.split("\n")
    let w=[],_followKey;
    v.forEach((x,i)=>{
      x=x.trim()
      if(x.match(/^[\,\{\}\[\]]$/)){
        _followKey=0
        return
      }
      x=x.replace(/[\[ ]+$/,"")
      
      if(x.length>1&&!_followKey&&!x.endsWith(",")&&!x.endsWith("{")){
        if(!v[i+1]||!v[i+1].trim().match(/[\}\]]/)){
          _addErr(i)
          return
        }
      }

      x=x.replace(/[\, \{\[]+$/,"")

      if(x.endsWith(":")){
        _followKey=1
        x+="0"
      }
      if(x.endsWith("}")){
        if(x.length==1){
          if(_followKey){
            _addErr(i-1)
          }
          return
        }else if(x[0]!="{"){
          x="{"+x
        }
      }else if(x.includes(":")){
        if(x[0]=="{"){
          x+="}"
        }else if(x[0]=="["){
          if(x.length>1){
            x+="}]"
          }
        }else{
          x="{"+x+"}"
        }
      }else if(_followKey){
        if(x.match(/^[\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC\_\$]+$/)&&$.isNumeric(x)){
          _addErr(i)
        }else if(_isErr(x)){
          _addErr(i)
        }
        return
      }
      if(_isErr(x)){
        _addErr(i)
      }
    })
    return w
    function _addErr(i){
      let vv=v[i]
      if(_startLine!==undefined){
        vv=_startLine+i+": "+vv
      }
      w.push(vv)
    }
    function _isErr(v){
      try{
        let x;
        x=_Util._eval("x="+v)
      }catch(ex){
        return 1
      }
    }
  },
  _flashElement:function(o,i){
    if(o){
      i=i||200
      $(o).fadeOut(i/2).fadeIn(i/2)
    }
  },
  _inSelectOption:function(v){
    return v.tagName=="OPTION"&& (v.parentElement.tagName=="SELECT"||(v.parentElement.parentElement&&v.parentElement.parentElement.tagName=="SELECT"))
  },
  _isIgnoreElement:function(v){
    return ["HTML","SCRIPT","LINK","HEAD","META","BASE","STYLE","BR","HR"].includes(v.tagName)||_Util._inSelectOption(v)
  },
  _isObjOrArray:function(v){
    return v&&[Array,Object].includes(v.constructor)
  },
  _handleRequestData:function(v){
    if(v&&[Object,Array].includes(v.constructor)){
      for(let k in v){
        if(v[k]=="bz-skip"){
          delete v[k]
        }else if(v[k]=="true"){
          v[k]=true
        }else if(v[k]=="false"){
          v[k]=false
        }else{
          _Util._handleRequestData(v[k])
        }
      }
    }
  },
  /*
  like: 
    s="lws ok"
    m=" "
    w="oo"
    result:"lwsoo ok"
  */
  _ajax:function(a,_proxy){
    a.async=!!a.async
    _Util._handleRequestData(a.data)
    let _jsonData
    $util.generateDataByRegex(a.query,0,(v)=>{
      a.query=v
      $util.generateDataByRegex(a.data,0,(v)=>{
        a.data=v
        if(_proxy){
          a={
            url:_proxy,
            method:"POST",
            headers:{
              "content-type":"application/json"
            },
            data:{
              method:a.method,
              url:a.url,
              data:a.data,
              headers:a.headers
            },
            complete:a.complete,
            async:a.async
          }
          return _doIt()
        }
        _doIt()
      })
    })
    
    function _doIt(){
      _jsonData=a.data
      if(Object.keys(a.headers||{}).find(x=>{
        if(x.toLowerCase()=="origin"){
          return 1
        }
      })){
        if(!BZ.TW||BZ.TW.closed){
          BZ._launchCurEnvUrl(_IDE._data._setting.curEnvironment,function(){
            _Util._originAJax(a,a.complete)
          })
        }else{
          _Util._originAJax(a,a.complete)
        }
        return
      }
      try{
        if(_jsonData){
          if(!a.contentType||a.contentType.toLowerCase().includes("json")){
            a.data=JSON.stringify(a.data)
          }else if(a.contentType.toLowerCase().includes("form")&&_Util._isJsonValueString(_jsonData)){
            _jsonData=_Util._strToJson(_jsonData)
            if(_jsonData.constructor==Object){
              _jsonData=a.data=_Util._objToAPIParameter(_jsonData)
            }
          }
        }
      }catch(ex){
        a.complete({message:ex.stack})
      }
      
      if(bzTwComm._isIDE()){
        XMLHttpRequest.prototype._XMLHttpRequestSend=XMLHttpRequest.prototype.send
        XMLHttpRequest.prototype.send=function(v){
          a.data=v||a.data
          this.abort()
          XMLHttpRequest.prototype.send=XMLHttpRequest.prototype._XMLHttpRequestSend
          delete XMLHttpRequest.prototype._XMLHttpRequestSend
          _callExtensionBackgroud()
        }
      }
      // if(a.contentType){
        // a.headers=a.headers||{}
        // a.headers["Content-Type"]=a.contentType
        // delete a.contentType
      // }
      $.ajax(a)
    }
    function _showInfo(_status,_msg){
      _msg=_Util._formatMessage(_bzMessage._system._error._ajaxFailed,[
        _status,
        a.url,
        a.headers?JSON.stringify(a.headers,0,2):"",
        a.query?JSON.stringify(a.query,0,2):"",
        a.body?JSON.stringify(a.body,0,2):"",
        JSON.stringify(_msg,0,2).substring(0,200)])
      alert(_msg)
    }
    function _callExtensionBackgroud(){
      if(!a.url.match(/^http/)){
        a.url="http:"+a.url
      }

      _extensionComm._callBackground(function(r){
        let ad={}
        for(var k in a){
          if(!["async","cache"].includes(k)||(a[k]!==null&&a[k]!==undefined&&!a[k].constructor==Function)){
            ad[k]=a[k]
          }
        }
        r.request={
          data:_jsonData,
          method:a.method,
          url:a.url,
          headers:a.headers
        }
        if(r.status!="error"&&_Util._isAPISucessStatus(r.status)){
          r.responseText=r.data
          _toData(r.data,function(ro){
            if(ro){
              if(ro.constructor==Blob){
                r.data=ro
              }else if([Object,Array].includes(ro.constructor)){
                r.responseJSON=ro
              }
            }
            
            if(a.complete){
              a.complete(r)
            }else{
              a.success(r)
            }
          })
        }else{
          if(a.error){
            a.error(r)
          }else if(a.complete){
            a.complete(r)
          }
          if(!BZ._isAutoRunning()){
            _showInfo(r.status,r.message||r.data)
            BZ._data._uiSwitch._apiResultTab="_result"
          }
        }
      },"ajax",a)
    }
    
    function _toData(v,_fun){
      if(a.responseType){
        _fun(new Blob([v.constructor==String?_stringToBinaryArray(v):v]))
      }else{
        try{
          if(v&&"[{".includes(v.trim()[0])){
            v=JSON.parse(v)
          }
          _fun(v)
        }catch(e){}
      }
    }

    function _stringToBinaryArray(str) {
      var buf = new ArrayBuffer(str.length*1); // 2 bytes for each char
      var bufView = new Uint8Array(buf);
      for (var i=0, strLen=str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }
  },
  _originAJax:function(d,_fun){
    if(bzTwComm._isIDE()){
      bzTwComm._postToIDE({_fun:"_originAJax",_scope:"_Util",_args:[d,_fun]});
      return
    }
    if(Object.keys(d.headers||{}).find(x=>{
      if(x.toLowerCase()=="origin"){
        if(d.headers[x].includes(location.host)){
          return 1
        }
      }
    })){
      let _jsonData=d.data
      d.request=_Util._clone(d)
      if(_jsonData){
        d.data=JSON.stringify(d.data)
      }
      d.complete=function(r){
        r.headers=d.headers
        r.request=d.request
        if(_jsonData){
          d.request.data=_jsonData
        }

        _fun(d)
      }
      $.ajax(d)
    }
  },
  _removeValueFromArray:function(a,v){
    while(1){
      let i=a.indexOf(v)
      if(i==-1){
        return
      }
      a.splice(i,1)
    }
  },
  _toggleArray:function(a,v){
    let i=a.indexOf(v)
    if(i>=0){
      a.splice(i,1)
    }else{
      a.push(v)
    }
  },
  _isSysButton:function(o){
    return o.tagName=="BUTTON"||(o.tagName=="INPUT"&&["submit","button","reset","image"].includes(o.type))
  },
  _getRandomSelection:function(p){
    let rv=_descAnalysis._retrieveTextForElementPathItem(p),ps=[],vv;
    if(rv.startsWith("/{random")){
      p.find(v=>{
        if(v.includes(rv)){
          vv=v
          return 1
        }
        ps.push(v)
      })
      if(ps.length){
        ps.push(0)
        ps=_Util._findDoms(ps)[0]
        if(ps){
          let e=rv.split(":")[1],f;
          if(e){
            e=e.split("|")
            f=e[0]
            e=e[1]
            if(e){
              e=e.substring(0,e.length-2).split(",")
            }else if(f){
              f=f.substring(0,f.length-2)
            }
          }
          if(!f){
            vv=vv.replace(rv,"")
            f=vv.replace(/(\:|\[)(near|input|data|text|panel|contains|Contains|textElement|after|before|endContains|endEqual|equal|RowCol|rowcol|name|title|placeholder)(\(|\"|\'|\=|)(\)|\"|\')?/,"")
            if(f==vv){
              f=vv.replace(/\:attr\([^=]+\=\)/,"")
            }
          }

          let pps=[]
          if(f&&f[0]=="!"){
            ps=$(ps).find("*").not(f.substring(1)).toArray()
          }else{
            ps=$(ps).find(f).toArray()
          }
          ps.forEach(x=>{
            let w=$util.getElementText(x)
            if(w&&(!e||!e.includes(w))){
              pps.push(x)
            }
          })

          let o=$util.randomItem(pps)
          if(o){
            p.find((v,i)=>{
              if(v.includes&&v.includes(rv)){
                p[i]=v.replace(rv,$util.getElementText(o.value))
                return
              }
            })
            return o.value
          }
          return
        }
      }
    }
  },
  //o: element
  //c: box css selector
  _getBox:function(o,c){
    c=$(c).toArray()
    return c.find(v=>{
      return $(v).find(o).length
    })
  },
  _csvToObj:function(c,_msg){
    c=c||""
    var rs=c.trim().split("\n");
    rs[0]=_Util._toSBC(rs[0])
    var cs=rs[0].split("\t");
    var _data=[];
    var _start=0;
    if(cs[0]=="_key"){
      _data={};
      _start=1;
    }
    cs=cs.map(k=>{
      return _toKeyName(k,1)
    })

    if (rs.length>1) {
      for(var i=1;i<rs.length;i++){
        var d={};
        
        if (!rs[i]&&rs.length==i+1&&!_Util._isEmpty(_data)) {
          continue;
        }
        var vs=rs[i].split("\t");
        if (_start) {
          vs[0]=_toKeyName(vs[0],1);
          if (!_data[vs[0]]) {
            _data[vs[0]]=d;
          }else{
            _Util._alertMessage(_Util._formatMessage(_bzMessage._system._error._switchCsvToObjError,[(_msg||"")+" row: '"+d[cs[ii]]+"'"]));
            return;
          }
        }else{
          _data.push(d);
        }
        for(var ii=_start;ii<cs.length;ii++){
          if (d[cs[ii]]!=undefined) {
            _Util._alertMessage(_Util._formatMessage(_bzMessage._system._error._switchCsvToObjError,[(_msg||"")+" column: '"+d[cs[ii]]+"'"]));
            return;
          }
          let v=vs[ii]
          if (v) {
            d[cs[ii]]=_parseValue(v);
          }else{
            d[cs[ii]]="";
          }
        }
      }
    }
    return _data;
    
    function _parseValue(v){
      try{
        if(v.match(/^[\{\[].+[\}\]]$/)){
          v=JSON.parse(v)
          return v
        }
      }catch(ex){}
      try{
        if(v.match(_Util._dataRegex)){
          v=_Util._eval("v="+v)
        }
      }catch(ex){}
      return v
    }
    function _toKeyName(v){
      v=v.replace(/[ \-\;\@\#\&\^\$]/g,"_")
      if($.isNumeric(v)){
        v="_"+v
      }
      v=v.replace(/_+/g,"_").replace(/_$/g,"")

      return v
    }
  },
  _stringToData:function(v,_bkData,_bkKey){
    if(!v||[Object,Array].includes(v.constructor)){
      return _return(v)
    }
    let n=parseFloat(v);
    if(n==v){
      return _return(n)
    }
    if(v.constructor==String&&v.includes("\t")){
      n=_Util._csvToObj(v)
    }else{
      try{
        if(v.constructor==Function){
          n=v()
        }else if(v.constructor==String&&v.trim().match(/^[\{\[].+[\}\]]$/s)){
          n=_Util._strToJson(v)
        }else{
          if(_Util._isFunction(v)){
            n=_Util._eval("n="+v)
          }else{
            let vv=v.trim().split("\n")
            while(vv.length&&!vv[vv.length-1].trim().replace(/;/g,"")){
              vv.pop()
            }
            if(!_Util._isEmpty(vv)){
              vv[vv.length-1]="return "+vv[vv.length-1]
              vv=vv.join("\n")
              n=_Util._eval("n=(()=>{\n"+vv+"\n})()")
            }
          }
        }
        if(n===undefined||n===null){
          return _return(n)
        }else if($.isNumeric(n)){
          if(v.includes(",")){
            v=v.split(",")
            if($.isNumeric(v[0])){
              //This is a number array
              n=v.map(a=>{return a.trim()})
            }
          }
        }else if(n.constructor==RegExp){
          if(v.includes("/,/")){
            n=v.split(",")
            n=n.map(a=>{return a.trim()})
          }
        }else if(n&&n.constructor==Function){
          n=n()
        }
      }catch(e){
        if(e.message.includes("debugger")&&v.includes("debugger")){
          v=v.replace(/debugger;?/,"").trim()
          if(!BZ._isAutoRunning()){
            alert(_bzMessage._task._debuggerError+v)
          }
          return _Util._stringToData(v,_bkData,_bkKey)
        }
        if(v&&v.constructor==String&&_Util._hasCode(v)){
          console.error(e.stack)
        }

        if(v.includes(",")){
          n=v.split(",")
          n=n.map(a=>{return a.trim()})
        }else{
          n=v
        }
      }
    }
    n=$util.generateDataByRegex(n,0,_return)
    if($.isNumeric(n)){
      n=parseFloat(n)
    }
    return n
    
    function _return(v){
      if($.isNumeric(v)){
        n=parseFloat(v)
      }
      if(_bkData){
        if(_bkData.constructor==Function){
          _bkData(v)
        }else if(_bkKey){
          _bkData[_bkKey]=v
        }
      }
      return v
    }
  },
  _stringToJSONString:function(v){
    v=_Util._stringToData(v)
    if(v&&v.constructor!=String){
      v=JSON.stringify(v,0,2)
    }
    return v
  },
  async _asyncTimeout(v) {
    return new Promise(_fun=> {
      setTimeout(()=>{
        _fun()
      },v)
    });
  },
  async _asyncFun(_fun,_time,_bkFun){
    while(1){
      if(_fun()){
        return _bkFun&&_bkFun()
      }
      await _Util._asyncTimeout(_time)
    }
  },
  _getMixDataLevel:function(v,i){
    i=i||0
    var dp=i,_max=0;
    if(v&&[Object,Array].includes(v.constructor)){
      for(var k in v){
        var pp=_Util._getMixDataLevel(v[k],i+1)
        if(pp>_max){
          _max=pp
        }
      }
      return _max
    }else{
      return i
    }
  },
  _hasDeepArray:function(d){
    if(d&&[Object,Array].includes(d.constructor)){
      for(var k in d){
        var v=d[k]
        if(v&&v.constructor==Array){
          return 1
        }else if(v&&v.constructor==Object){
          var vv=_Util._hasDeepArray(v)
          if(vv){
            return 1
          }
        }
      }
    }
  },
  _toFileCSV:function(s){
    return s.split("\n").map(w=>{
      w=w.trim().split("\t")
      return w.map(v=>{
        if(v.includes(",")){
          return '"'+v.replace(/\"/g,'""')+'"'
        }else{
          return v
        }
      }).join(",")
    }).join("\n")
  },
  _spliceAll:function(vs,_fun){
    let _found=[]
    for(var i=0;vs&&i<vs.length;i++){
      var o=_fun(vs[i],i)
      if(o){
        _found.push(vs[i])
        vs.splice(i--,1)
      }
    }
    return _found
  },
  _findInObj:function(o,_fun){
    if(o&&[Object,Array].includes(o.constructor)){
      for(var k in o){
        if(_fun(o[k],k)){
          return {_value:o[k],_key:k}
        }
      }
    }
  },
  _findDeepObj:function(o,_fun,_stop,pk,ps){
    ps=ps||[]
    for(var k in o){
      ps.push(o[k])
      if(_fun(o[k],k,pk,ps,o)){
        if(_stop){
          ps.pop()
          return o[k]
        }
      }else if(_Util._isObjOrArray(o[k])){
        let v=_Util._findDeepObj(o[k],_fun,_stop,k,ps)!==undefined
        if(v){
          if(_stop){
            ps.pop()
            return v
          }
        }
      }
      ps.pop()
    }
  },
  _loopObj:function(o,_fun){
    if(o&&[Object,Array].includes(o.constructor)){
      for(var k in o){
        _fun(o[k],k)
      }
    }
  },
  _findAll:function(vs,_fun){
    var os=[]
    vs.forEach((v,i)=>{
      if(_fun(v,i)){
        os.push(v)
      }
    })
    return os
  },
  _handlePrePanel:function(d){
    $(d).on("mousedown",".bz-pre-box",function(e){
      let p=e.target

      _Util._copyText(p.children[0]||p,this.ownerDocument)
    })
  },
  _loadTextFromFile:function(_file,_fun){
    let _reader = new FileReader();

    _reader.readAsText(_file);

    _reader.onload = function() {
      _fun(_reader.result)
    };

    _reader.onerror = function() {
      alert(_bzMessage._system._error._importFileError,_reader.error);
    };
  },
  _loadTextFromFiles:function(_files,_fun){
    let _reader = new FileReader(),
        rs=[];
    

    function _readFile(i) {
      if( i >= _files.length ) {
        return _fun(rs);
      }
      var _file = _files[i];
      _reader.onload = function(e) {  
        rs.push(e.target.result);
        _readFile(i+1)
      }
      _reader.readAsText(_file);
    }
    _readFile(0);

    _reader.onerror = function() {
      alert(_bzMessage._system._error._importFileError,_reader.error);
    };
  },
  _getZipFileContent:function(v,f){
    zip.createReader(new zip.BlobReader(v), function(zipReader) {
      zipReader.getEntries(function(_entries) {
        f(_entries)
			});
    }, function(a){alert(a)});
  },
  _extendViewDef:function(e,ex){
    var o=_Util._clone(e)
    for(var k in ex){
      if(k=="_jqext"){
        for(var kk in ex._jqext){
          o._jqext[kk]=ex._jqext[kk];
        }
      }else{
        o[k]=ex[k];
      }
    }
    return o;
  },
  // _insertTxtToEditor:function(o,w,_idx,_event){
  //   if($(o).hasClass("bz-js-editor")){
  //     return o._replaceSelectedText(o,w)
  //   }
  //   var start = o.selectionStart;
  //   var end = o.selectionEnd;
  //   _idx=_idx||w.length

  //   var $this = $(o);
  //   var value = $this.val();
    
  //   if(_idx<0){
  //     start+=_idx;
  //     _idx=w.length
  //   }

  //   $this.val(value.substring(0, start)+ w+ value.substring(end));

  //   o.selectionStart = o.selectionEnd = start + _idx;
  //   $(o).change();
  //   if(_event){
  //     _event.preventDefault()
  //   }
  //   if($(":focus")[0]!=o){
  //     $(o).focus();
  //   }
  // },
  _repeatLetter:function(w,i){
    let ws=""
    while(i--){
      ws+=w
    }
    return ws
  },
  _stringToObj:function(s){
    if(s&&s.constructor==String){
      try{
        s=_Util._eval("s="+s)
      }catch(e){}
    }
    return s
  },
  _getShareParent:function(o1,o2){
    if(o1.constructor==Array){
      return _getIn2(o1[0],o1[o1.length-1])
      let i1=parseInt((o1.length-1)/2)
    }else{
      return _getIn2(o1,o2)
    }
    
    function _getIn2(o1,o2){
      if($(o2).find(o1)[0]){
        return o2
      }
      while(o1.parentElement&&o1.tagName!="BODY"){
        if($(o1).find(o2).length||o1.tagName=="BODY"){
          return o1
        }
        o1=o1.parentElement
      }
    }
  },
  _getPathFromUrl:function(v){
    let h=_Util._retrieveHostFromUrl(v)
    if(h){
      v=v.replace(h,"")
    }
    v=v.replace(/^[\/]/,"").split(/[\?\#]/)[0].split("/")
    _Util._spliceAll(v,x=>{return !x})
    return v
  },
  _retrieveHostFromUrl:function(v){
    if(!v){
      return
    }

    v=v.url||v
    v=v.match(/^(https*|wss):\/\/[^\/]+/)
    return v&&v[0]
  },
  _formatStrAsJson:function(w){
    try{
      v=_Util._eval("v="+w)
      if(JSON.stringify(v)==w){
        return JSON.stringify(v,0,2)
      }
    }catch(e){}
    return w
  },
  _jsonToStr:function(s){
    if(s&&(s.constructor==Object||s.constructor==Array)){
      s=JSON.stringify(s,0,2)
    }
    return s
  },
  _strToJson:function(s,_parameter){
    let $parameter=_parameter||window.$parameter
    if(s&&s.constructor==String&&(_Util._hasCode(s)||s.match(/^[\{\[].*[\]\}]$/s))){
      try{
        if(s.constructor==String){
          if(bzTwComm._isExtension()){
            s=JSON.parse(s)
          }else{
            s=_Util._eval("s="+s)
          }
          if(s&&s.constructor==RegExp){
            s=s.toString()
          }
        }
        if(s&&[Object,Array].includes(s.constructor)){
          _Util._findDeepObj(s,(v,k,ps,pk,o)=>{
            if(v&&v.constructor==String){
              o[k]=_JSHandler._prepareData(v,0,0,_parameter)
            }
          })
        }
      }catch(e){
        s=_JSHandler._prepareData(s,0,0,_parameter)||s
      }
    }
    return s
  },
  _hasCode:function(v){
    return v&&v.match&&v.match(/\$(loop|parameter|parentModule|test|module|project|data|util|script|group|action)([^a-zA-Z0-9\u4E00-\u9FCC_\$]|$)/)
  },
  _hasInsertCode:function(v){
    return v&&v.match&&v.match(/\{\{[^\{]*\$(parameter|test|module|project|loop|parentModule|data|loop|util|script|control|group|action).*\}\}/)
  },
  _hasInsertCodeOnly:function(v){
    if(_Util._hasCode(v)){
      return !_Util._hasCode(v.replace(/\{\{[^\{]*\$(parameter|test|module|project|loop|parentModule|data|loop|util|script|control|group|action).*\}\}/g,""))
    }
  },
  _parseCode:function(s){
    let vs=[]
    s=s.match(/\{\{[^}]+\}\}/g)||[]
    s.forEach(c=>{
      c=c.match(/\$(loop|parameter|test|module|project|group|action)[.\[]?[a-zA-Z0-9\u4E00-\u9FCC_\$\.\[\]]*/g)||[]
      vs=vs.concat(c)
    })
    return [...new Set(vs)]
  },
  _formatObjectToFinalData:function(o,_parameter){
    if(o&&[Object,Array].includes(o.constructor)){
      for(var k in o){
        if([Array,Object].includes(o[k].constructor)){
          _Util._formatObjectToFinalData(o[k])
        }else{
          let v= _ideDataManagement._initRandomValue(_JSHandler._prepareData(o[k]))
          let kk=_JSHandler._prepareData(k,0,0,_parameter)
          if(kk!=k&&kk){
            delete o[k]
            k=kk
          }
          o[k]=v
        }
      }
    }else{
      o=_JSHandler._prepareData(o+"",0,0,_parameter)
      o=_Util._strToJson(o,_parameter)
    }
    return o
  },
  _objToAPIParameter:function(v){
    if(v&&(_Util._isObjOrArray(v))){
      var ds=[]

      _getDataList(v,"",ds)
      return ds.join("&")
    }else{
      return v
    }

    function _getDataList(v,ks,ds){
      if(v&&_Util._isObjOrArray(v)){
        for(let k in v){
          _getDataList(v[k],ks?ks+"["+k+"]":k,ds)
        }
      }else{
        ds.push(encodeURIComponent(ks)+"="+encodeURIComponent(v))
      }
    }
  },
  _parameterToObj:function(v){
    if(v&&v.constructor==String){
      v=v.trim()
      try{
        v=_Util._eval("v="+v)
      }catch(e){
        if(v.includes("=")){
          v=v.split("&")
          var o={}
          v.forEach((a,i)=>{
            a=a.replace(/\+/g," ")
            a=a.split("=")
            let k=decodeURIComponent(a[0])
            let ks=k.split("[")
            if(ks.length>1){
              ks=ks.map(x=>x.replace("]",""))
              let oo=o
              ks.forEach((x,i)=>{
                oo[x]=oo[x]||{}
                if(i==ks.length-1){
                  oo[x]=decodeURIComponent(a[1])
                }else{
                  oo=oo[x]
                }
              })
            }else{
              o[k]=decodeURIComponent(a[1])
            }
          })
          v=o
        }
      }
    }
    return v
  },
  _speakCurWords:function(w){
    if(_Util.speakingWords){
      window.speechSynthesis.cancel()
    }
    _Util.speakingWords = new SpeechSynthesisUtterance(w);
    if(curUser.language=="cn"){
      _Util.speakingWords.lang="zh-CN"
    }
    _Util.speakingWords.onend=()=>{
      _Util.speakingWords=0
    };
    window.speechSynthesis.speak(_Util.speakingWords);
  },
  _focusNextByTab:function(_curElement){
    var os=$(BZ.TW.document).find("*"),_found=0;
    var _idx=os.index(_curElement)
    var _tIdx=_curElement.tabIndex
    while(!_found){
      for(var i=_idx+1;i<os.length;i++){
        var o=os[i]
        if(o==os[i]){
          if(_tIdx>0){
            _tIdx=0
            _idx=0
          }
        }
        if($(o).css("display")!="none"&&$(o).css("visibility")!="hidden"){
          if(["INPUT","SELECT","A","BUTTON","TEXTAREA"].includes(o.tagName)&&o.type!="hidden"){
            if(_tIdx<0){
              if(o.tabIndex==0){
                return o.focus()
              }
            }else if(_tIdx==0){
              if(o.tabIndex==0||o.tabIndex==1){
                return o.focus()
              }
            }else{
              if(o.tabIndex==_tIdx+1){
                return o.focus()
              }
            }
          }
        }
      }
      if(!_found){
        if(_idx>=0){
          _idx=-1
        }else{
          break
        }
      }
    }
  },
  _formatTimeInMinSecond2:function(t){
    let h=Math.floor(t/60/60)||""
    if(h){
      h+=":"
    }
    t=t%3600
    let m=_Util._formatNumberLength(Math.floor(t/60),2)+":"
    let s=_Util._formatNumberLength(t%60,2)
    return h+m+s
  },
  _formatTimeInMinSecond:function(tt){
    tt=parseInt(tt)
    let p=""
    if(tt<0){
      p="- "
      tt=0-tt
    }
    var t=Math.floor(tt/1000)
    var s=Math.floor(t%60)
    var m=Math.floor(t/60)
    var h=Math.floor(m/60)
    m=m%60
    if(h){
      h+=":"
    }else{
      h=""
    }
    if(m){
      m+=":"
    }else{
      m=""
    }
    if(!s){
      s=0
    }
    tt=tt%1000
    return p+h+m+s+(!h&&!m&&s<10&&tt?"."+tt:"")+(!h&&!m?"s":"")
  },
  _formatTimer:function(t){
    let h="",m=""
    if(t>3600000){
      h=parseInt(t/3600000)+"h "
      t=t%3600000
    }
    if(t>60000){
      m=parseInt(t/60000)+"m "
      t=t%60000
    }
    if(t>10000||m){
      t= (Math.floor(t/1000)||0)+"s"
    }else{
      t= (Math.round(t/100)/10||0)+"s"
    }
    return h+m+t
  },
  _copyText:function(w,_doc,ui){
    _doc=_doc||document
    let _isInput=["INPUT","TEXTAREA"].includes(w.tagName)
    let el =_isInput?w:$("<textarea readonly style='position:absolute;left:-9999px'></textarea>").appendTo(_doc.body);
    if(!_isInput){
      w=w.innerText||w
      if([Object,Array].includes(w.constructor)){
        w=JSON.stringify(w,0,2)
      }
      el.val(w)
    }
    el.select();
    _doc.execCommand('copy');
    if(!_isInput){
      el.remove();
    }
    w=ui||w
    if(w.constructor!=String){
      if(_isInput){
        w.select();
        w.focus()
      }else{
        let pu=w.parentElement||w,
            c="bz-enable-select"
        if(!$(pu).hasClass(c)){
          $(pu).addClass(c)
        }else{
          c=0
        }
        let _range = new Range(),
            _sel = w.ownerDocument.defaultView.getSelection();
            _sel.removeAllRanges();
            _range.collapse(true);
        _range.setStart(w, 0);
        _range.setEnd(w, 1);
        _sel.addRange(_range);
        setTimeout(()=>{
          _sel.removeAllRanges();
          if(c){
            $(pu).removeClass(c)
          }
        },100)
      }
    }
  },
  
  _copyData:function(o,_doc){
    _doc=_doc||document
    let d=$("<textarea readonly style='position:absolute;left:-9999px'></textarea>")
    d.appendTo(_doc.body);
    d.val(JSON.stringify(o))
    _Util._copyText(d[0],_doc)
    d.remove()
  },
  _getClipboardValue:function(_fun){
    try{
      let x=navigator.clipboard.readText();
      x.then(text => {
        try{
          _fun(text);
        }catch(ex){}
      })
    }catch(e){}
  },
  _objToURI:function(d){
    let q;
    for(let k in d){
      let w;
      if(d[k]&&[Object,Array].includes(d[k].constructor)){
        w=JSON.stringify(d[k]).replace(/\"/g,"")
      }else{
        w=(d[k]+"").replace(/^[\'\"]([^\'\"]+)[\'\"]$/,"$1")
      }
      if(w=="bz-skip"){
        continue
      }
      if(q){
        q+="&"
      }else{
        q="?"
      }
      if(!_Util._hasCode(w)){
        w=encodeURIComponent(w)
      }
      q+=k+'='+w;
    }
    return q
  },
  //d: data, t: with tab?
  _formatDataWithVariable:function(d,t){
    if(d){
      let w=d.trim()
      if(w.includes("\n")){
        return w
      }
      if(!("{[".includes(w[0])&&"}]".includes(w[w.length-1]))){
        return d
      }
      try{
        d=_Util._parseJSONWithRefDataToObj(d,1)
        d=_Util._refDataToJSON(d)
      }catch(ex){
      }
      return d
    }else{
      return d
    }
  },
  _isFocusable:function(o){
    return ["A","BUTTON","INPUT","SELECT","TEXTAREA"].includes(o.tagName)||o.contenteditable
  },
  _replaceObjValue:function(o,w,r){
    if(o&&[Object,Array].includes(o.constructor)){
      for(var k in o){
        o[k]=_Util._replaceObjValue(o[k],w,r)
      }
    }else if(o){
      o=o+""
      return (o+"").replace(w,r)
    }
    return o
  },
  _getExistItemInList:function(o,a,_list){
    for(var i=0;i<_list.length;i++){
      var v=_list[i]
      if(v[a]==o[a]){
        return v
      }
    }
  },
  _isEmpty:function(v){
    return !v||[Array,Object].includes(v.constructor)&&$.isEmptyObject(v)
  },
  _findValueInObj:function(o,_fun){
    if(o){
      for(var k in o){
        if(_fun(o[k],k)){
          return o[k]
        }
      }
    }
  },
  _findKeyInObj:function(o,_fun){
    for(var k in o){
      if(_fun(o[k],k)){
        return k
      }
    }
  },
  _findIFrames:function(doc,fs){
    $(doc).find("*").each(function(i,v){
      if(v.tagName=="IFRAME"){
        fs.push(v)
        if(v.contentDocument){
          _Util._findIFrames(v.contentDocument,fs)
        }
      }else if(v.shadowRoot){
        _Util._findIFrames(v.shadowRoot,fs)
      }
    })
  },
  _getAllRadioValues:function( r ) {
    let _radios = document.getElementsByName( r.name ),vs=[];
    
    for( i = 0; i < _radios.length; i++ ) {
      vs.push(_radios[i].value);
    }
    return vs;
  },
  _getQuickPath:function(e){
    if(!e){
      return
    }
    var t=$util.getElementText(e)||""
    t=t.trim()
    if(t){
      t=t.split("\n")[0].substring(0,50)
      t=":Contains("+t+")"
    }

    while(e.parentElement){
      t=">"+_Util._getCurPath(e)+t
      e=e.parentElement
      if(e.tagName=="BODY"){
        return "BODY"+t
      }
    }
    return "BODY"
  },
  _filterOutHidden:function(os,_result){
    os=os||[]
    for(var i=0;i<os.length;i++){
      if(_Util._isHidden(os[i])){
        if(!_result){
          os.splice(i--,1)
        }
      }else if(_result){
        _result.push(os[i])
      }
    }
    
  },
  _elementTxtToPath:function(os){
    if(os.constructor==String){
      os=[os]
    }
    for(var i=0;i<os.length;i++){
      var v=(""+os[i]).trim();
      if(v===""){
        os.splice(i,1);
        i--;
      }else if(os[i].constructor==String && v.includes(" ")){
        var b=[],_map={"(":")","[":"]"};
        var vs="",vv=[];
        for(var n=0;n<v.length;n++){
          var c=v[n];
          if(c==" " && !b.length){
            vv.push(vs);
            vs="";
          }else if("([".includes(c)){
            b.unshift(_map[c]);
          }else if(c==b[0]){
            b.shift();
          }
          vs+=c;
        }
        vs=vs.trim()
        if(vs){
          vv.push(vs);
        }
        if(vv.length>1){
          os.splice(i,1)
          for(var n=0;n<vv.length;n++){
            os.splice(i+n,0,vv[n]);
          }
        }
      }
    }
    return os;
  },
  _getElementByQuickPath:function(p){
    if(p.constructor==Array){
      return $util.findDom(p)
    }
    p=p.split(">")
    if(p[0]=="BODY"){
      p.shift()
    }
    var o=document.body
    p.forEach(function(v){
      v=v.split(":")
      var vv=v[1]
      if(vv&&vv.match(/[0-9]+/)){
        vv=parseInt(vv.match(/[0-9]+/)[0])
      }else{
        vv=0
      }
      for(var i=0;i<o.children.length;i++){
        var t=o.children[i]
        if(t.tagName==v[0]){
          if(!vv){
            o=t;
            return
          }else{
            vv--
          }
        }
      }
    })
    return o
  },
  _getCurPath:function(e){
    var i=0,t=e.tagName;
    while((e = e.previousSibling)!=null){
      if(e.tagName==t){
        i++;
      }
    }
    return i?t+":eq("+i+")":t
  },
  _toCompareableWord:function(w,splitChar){
    if(w){
      w=w.replace(/([^A-Z]+)([A-Z][^A-Z]+)/,"$1_$2").trim().toLowerCase().replace(/\s+/g,' ').replace(/[^0-9a-zA-Z\u4E00-\u9FCC]+/g,'_').replace(/[_]+/g,'_')
      w=w.split("_").map(x=>{return x.plural()}).join(splitChar||"_");
    }
    return w
  },
  _parseCamelWords:function(w){
    if(w){
      w=w.replace(/([^A-Z]*|[A-Z]+)([A-Z][^A-Z]+)/g,"$1 $2").replace(/([^A-Z ]+)([A-Z]+)/g,"$1 $2").replace(/( [A-Z][^A-Z])/g,function(v){return v.toLowerCase()});
      w=w.trim().replace(/\s+/g," ")
    }
    return w
  },
  _toCamelWords:function(w,_chkUpperCase){
    w=(w||"").toString().trim()
    if(w){
      w= w.split(/[^\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC]]|_+| +|-+/).map((v,i)=>{
        if(i){
          return _Util._toCapitalWord(v)
        }else{
          return v
        }
      }).join("")
      if(_chkUpperCase&&w[0]==w[0].toUpperCase()&&w[1]&&w[1]==w[1].toUpperCase()){
        return w
      }
      w=w[0].toLowerCase()+w.substring(1)
      return w
    }
    return ""
      
  },
  _idToName:function(w){
    return _Util._toCapitalWord(_Util._parseCamelWords(w).plural(1))
  },
  _getTagNameFromElementPath:function(p){
    for(var i=p.length-1;i>0;i--){
      if(!$.isNumeric(p[i])){
        return p[i]
      }
    }
  },
  _isDotableKey:function(k){
    return !k.match(/^[0-9]|[^_$a-zA-Z0-9\u4E00-\u9FCC]/)
  },
  //m:property map, o: object data, p: path
  _objToProperties:function(m,o,p,_noFunStr){
    if(o&&(o.constructor==Object||o.constructor==Array)){
      for(var k in o){
        _Util._objToProperties(m,o[k],_Util._mergeDataPath(p,k),_noFunStr)
      }
    }else if(!o||o.constructor!=Function){
      if(o&&o.constructor==String){
        if(o.trim().startsWith("function")&&_noFunStr){
          return m
        }else if(o.length>100){
          o=o.trim().substring(0,100)
        }
      }
      if(p){
        m[p]=o
      }else{
        m=o
      }
    }
    return m
  },
  _mergeDataPath:function(p,k){
    var pk;
    if(!p){
      pk=k
    }else if(_Util._isDotableKey(k)){
      pk=p+"."+k
    }else if($.isNumeric(k)){
      pk=p+"["+k+"]"
    }else{
      pk=p+"['"+k+"']"
    }
    return pk
  },
  _hasChinese:function(w){
    return w.match(/[\u4E00-\u9FCC]/g)
  },
  _countWords:function(w){
    let ws=w.match(/[\u4E00-\u9FCC]/)
    if(ws){
      return ws.length
    }
    return w.split(/[^A-Za-z]/).length
  },
  _getDiffWord:function (o,n){
    o=o.replace(/\s/g," ")
    n=n.replace(/\s/g," ")
    if(BZ._data._curProject.language=="cn"){
      s=""
    }else{
      s=" "
    }

    o=o.split(s)
    n=n.split(s)

    while(o.length&&n.length&&o[0]==n[0]){
      o.shift()
      n.shift()
    }
    if(o.length&&n.length){
      o=o.join(s)
      n=n.join(s)
      return {
        o:o,n:n
      }
    }
  },
  //s:soure words
  //r:remove word
  //ex. s="abc abcd xabc 中国abc abc中国", x="abc", y=" ", --> "abcd xabc 中国 中国"
  //ex. s="abc abcd xabc 中国abc abc中国", w="中", --> "abc abcd xabc 国abc abc国"
  _removeWord:function(s,r,_handleStar,i){
    var re,rr,ss=s,rs;
    if(!s){
      return s
    }
    if(BZ._data._curProject.language=="cn"){
      if(!r.match(/[a-z0-9] [0-9a-z]/)&&r.match(/\s/)){
        r=r.replace(/ /g,"")
        s=s.replace(/ /g,"")
      }
    }
    if(!i){
      r=r.replace(/([\+\?\$\^\(\)\[\]\{\}\|\\])/g,"\\$1")
      if(_handleStar){
        
      }else{
        r=r.replace(/([\*\.])/g,"\\$1")
      }
    }
    if(_Util._hasChinese(r)){
      re=new RegExp(r,"gi")
      rr=" "
    }else{
      re=new RegExp("(^|[^0-9a-z])"+r+"([^0-9a-z]|$)","gi")
      rr="$1 $2"
    }
    rs=s.replace(re,rr).trim()
    if(rs==s){
      return i?ss:_Util._removeWord(ss,r,_handleStar,1)
    }else{
      return i?rs:_Util._removeWord(rs,r,_handleStar,1)
    }
  },
  _getVisibleElements:function(_area,_css){
    if(_css&&_css.constructor==Array){
      _css=_css.join(",")
    }
    _css=_area.find(_css).toArray()
    _Util._filterOutHidden(_css)
    return _css
  },
  _includesWord:function(s,r,_handleStar){
    return s!=_Util._removeWord(s,r,_handleStar)
  },
  _includesWordWithoutSign:function(s,i){
    s=_Util._removeSign(s," ")
    i=_Util._removeSign(i," ")
    return s!=_Util._removeWord(s,i)
  },
  _generateIndentation:function(v){
    var s="";
    for(var i=0;i<v;i++){
      s+=" ... "
    }
    return s;
  },
  _strToRegex:function(v){
    if(v){
      if(!v.match(/^[\/].+[\/]$/)){
        v="/"+v+"/"
      }
      try{
        v=_Util._eval("v="+v)
        return v
      }catch(e){
        alert(e.message)
      }
    }
  },
  _replaceWord:function(w,x,y){
    if(!x || !y || !w){
      return w;
    }
    var x1=x[0],x2=x[x.length-1],r=x.replace(/([\(\)\{\}\[\].\$])/g,"\\$1");
    var c1=_Util._hasChinese(x1),c2=_Util._hasChinese(x2);
    
    if(c1&&c2){
      return w.replace(new RegExp(x,"g"),y).trim()
    }else if(c1){
      r=new RegExp("(.|^)"+r+"([^a-zA-Z0-9]|$)","g");
    }else if(c2){
      r=new RegExp("([^a-zA-Z0-9]|^)"+r+"(.|$)","g")
    }else{
      r=new RegExp("([^a-zA-Z0-9]|^)"+r+"([^a-zA-Z0-9]|$)","g")
    }
    return w.replace(r,"$1"+y+"$2")
  },
  //_nodes:childNodes, i: the first text node idx
  _pickTextFromNode:function(_nodes,i){
    var e=_nodes[i];
    var n,tw=e.textContent.trim();
    while(n=_nodes[i+1]){
      if(n.nodeType==3){
        var t=n.textContent.trim()
        if(t){
          tw+=" "+t
        }
      }else if(n.nodeType==1){
        break
      }
      i++
    }
    tw=_Util._filterTxt(tw)
    return {t:tw,i:i}
  },
  _pickAttrFromObj:function(o,ps){
    var oo={};
    if(ps.constructor==Object){
      ps=Object.keys(ps)
    }
    ps.forEach(function(v){
      try{
        v=v.split(".")
        let ood=oo,od=o;
        v.find((x,i)=>{
          if(i+1==v.length){
            ood[x]=od[x]
          }else{
            if(od[x]){
              ood[x]={}
              ood=ood[x]
              od=od[x]
            }else{
              return 1
            }
          }
        })
      }catch(e){}
    })
    return oo
  },
  _filterTxt:function(tw){
    return tw.replace(/[\(\)\[\]\{\}]/g," ").replace(/\s+/g," ").trim()
  },
  _insertInString:function(s,m,w){
    var i=s.indexOf(m);
    if(i>=0){
      return s.substring(0,i)+w+s.substring(i);
    }
  },
  _findCellElement:function(e,_parent){
    var k=_IDE._data._curVersion.setting.content.clickableElements;
    k=k?k+",":""
    k+="INPUT,TEXTAREA,SELECT,A,BUTTON,[contenteditable=true],[draggable=true]"
    var $e=$(e)
    try{
      if($e.is(k)){
        return e
      }
      if($e.find(k).length){
        return _parent?0:e
      }
      return _Util._findCellElement(e.parentElement,1)||(_parent?0:e)
    }catch(ee){}
  },
  _handleCodePoints:function(array) {
    var CHUNK_SIZE = 0x8000; // arbitrary number here, not too small, not too big
    var index = 0;
    var length = array.length;
    var result = '';
    var slice;
    while (index < length) {
      slice = array.slice(index, Math.min(index + CHUNK_SIZE, length)); // `Math.min` is not really necessary here I think
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
    }
    return result;
  },
  _getParentElementByCss:function(p,o){
    p=$(p).toArray()
    return p.find(a=>{
      return $(a).find(o).length
    })
  },
  _getParentByTagName:function(o,_name){
    while(o.parentElement && o.tagName!="BODY"){
      o=o.parentElement
      if(o.tagName==_name){
        return o
      }
    }
  },
  _focusNextInput:function(e){
    var _org=e, os=$(e.ownerDocument).find("INPUT,BUTTON,SELECT,TEXTAREA,SELECT,[contenteditable=true]");
    var i=os.index(e)+1,b;
    while(e){
      e=os[i++];
      
      if(e && !$(BZ.TW.document).find(".BZIgnore").find(e).length && !["file","hidden"].includes(e.type)&&!$(e).attr("disabled")&&!$(e).attr("readonly")){
        if(e.type=="radio" &&_org.type=="radio"&&e.name==_org.name){
          continue
        }
        if(e.tagName!="BUTTON"&&!["button","reset","submit"].includes(e.type)){
          break
        }else if(!b){
          b=e;
        }
      }
    }
    e=e||b
    if(e){
      e.focus()
    }
    return e
  },
  _formatTextToHTML:function(w){
    w=(w||"").toString()
    
    return w.replace(/\</g,"&lt;").replace(/\>/g,"&gt")
  },
  _isSameObj:function(a,b,ks){
    let av,bv;
    if(ks){
      return !ks.find(x=>!_Util._isSameObj(a[x],b[x]))
    }
    if(a&&b&&[Object,Array].includes(a.constructor)&&a.constructor==b.constructor){
      for(var k in a){
        av=a[k];
        bv=b[k]
        if(av&&[Object,Array].includes(av.constructor)&&bv&&bv.constructor==av.constructor){
          if(!_Util._isSameObj(av,bv)){
            return
          }
          continue
        }
        if(av!=bv){
          return
        }
      }
      for(var k in b){
        if(a[k]===undefined&&a[k]!=b[k]){
          return
        }
      }
      return 1
    }
    return a==b
  },
  _isSameArray:function(a,b,_key){
    if(a==b||(!a&&!b)){
      return 1
    }else if(!a||!b||a.constructor!=Array||b.constructor!=Array||a.length!=b.length){
      return 
    }
    for(var i=0;i<a.length;i++){
      if(!b.includes(a[i])){
        if(_key){
          var _found=0
          for(var j=0;j<b.length;j++){
            if(b[j][_key]==a[i][_key]){
              _found=1
              continue
            }
          }
          if(_found){
            continue
          }
        }
        return
      }
    }
    return 1
  },
  _isSameHost:function(u1,u2){
    u1=u1.split("/"+"/")
    u2=u2.split("/"+"/")
    
    if(u1[0]&&u2[0]){
      if(u1[0]!=u2[0]){
        return
      }
    }
    if(u1.length>1){
      u1=u1[1]
    }
    if(u2.length>1){
      u2=u2[1]
    }

    u1=u1.split(/[\/#]/)
    u2=u2.split(/[\/#]/)
    if(!u1[0]){
      u1.shift()
    }
    if(!u2[0]){
      u2.shift()
    }
    return u1[0]==u2[0]
  },
  _findBackground:function(d){
    var os=[];
    $(d).find("*").filter(function(i,v){
      if($(v).css("position")=="fixed" && !_Util._isHidden(v)){
        r=v.getBoundingClientRect();
        if(window.innerWidth-r.width<40 && window.innerHeight-r.height<40){
          os.push(v)
        }
      }
    })
    os.sort(function(a,b){
      return $(a).css("z-index")>=$(b).css("z-index")
    });

    return os.length?os[os.length-1]:d
  },
  _getBackgroundColor:function(e){
    var c=$(e).css("background-color");
    if((c.startsWith("rgba") && !c.endsWith(", 0)") && !c.startsWith("rgba(255, 255, 255, 0.")) || c!=="transparent"){
      return c;
    }
    
    if(e.tagName!="BODY"){
      return _Util._getBackgroundColor(e.parentElement)
    }
  },
  _toCapitalWord:function(w,_revert){
    if(w){
      if(_revert&&w.length>1&&w[1].toLowerCase()==w[1]){
        return w[0].toLowerCase()+w.substring(1)
      }else{
        return w[0].toUpperCase()+w.substring(1)
      }
    }else{
      return ""
    }
  },
  _isNoTextElement:function(e){
    return ["TEXTAREA","SELECT","IFRAME","SVG","LINK","TITLE","META","SCRIPT","STYLE","HEAD","HTML"].includes(e.tagName.toUpperCase())||_Util._inSelectOption(e)
  },
  _isNoVisibleElement:function(e){
    return ["OPTION","IFRAME","SVG","LINK","TITLE","META","SCRIPT","STYLE","HTML","HEAD"].includes(e.tagName.toUpperCase())
  },
  _isInContentEditable:function(e){
    if($(e).attr("contenteditable")){
      return 1;
    }
    if(e && e.tagName!="BODY"){
      return this._isInContentEditable(e.parentNode);
    }
  },
  _isInputObj:function(e,_chkReadonly){
    if(e.nodeType!=1){
      return
    }
    if((!_chkReadonly||!$(e).attr("readonly")||e.type=="file")&&this._isStdInputElement(e)||this._isInContentEditable(e)){
      return 1
    }
    let z=(e.dataset.bz||"").includes("$field")
    if(z){
      return $(":bz($form)").toArray().find(x=>{
        if($(x).find(e)[0]){
          return 1
        }
      })
    }
  },
  _isForm:function(c){
    return _Util._findInputs(c).length>1
  },
  _getElementContentText:function(e){
    if(e){
      let t=e.innerText||e.textContent
      if(!_Util._isInputObj(e)){
        e=_Util._findInputs(e)[0]
      }
      if(e){
        t=e.value||t
      }
      return t||""
    }
    return ""
  },
  _getAcceptFileType:function(f){
    return ((f.accept||"").split(",")[0]||"").split("/").pop().toLowerCase()
  },
  _isUrl:function(s){
    return s&&s.match(/^(https?:)?\/\/.+/)&&!s.includes("\n")
  },
  _findInputs:function(e,_inBz){
    let bz=e&&e.dataset&&e.dataset.bz,
        _css=_cssHandler._getInputCss(),
        os=[]
    if(_inBz||bz&&bz.includes("$form")){
      for(let o of e.children){
        if($(o).is(_css)){
          if(!_Util._isHidden(o)){
            os.push(o)
          }
        }else{
          let ob=o.dataset.bz
          if(ob&&ob.includes("$field")){
            os.push(o)
          }else if(ob&&ob.includes("$skip")){
            continue
          }else{
            os.push(..._Util._findInputs(o,1))
          }
        }
      }
      return os
    }else{
      return $(e).find(_css).toArray().filter(x=>{
        return !_Util._isHidden(x)||["radio","checkbox"].includes(x.type)
      });
    }
  },
  _isInputButton:function(e){
    return e.tagName=="INPUT" && ["image","button","submit","reset"].includes(e.type)
  },
  _setTabSize:function(v,ts){
    var vs=v.split(/[\t\n\r]/);
    var m=0;
    for(var i=0;i<vs.length;i++){
      if(m<vs[i].length){
        m=vs[i].length
      }
    }
    if(m<10){
      m=9;
    }
    m++;
    for(var i=0;ts&&i<ts.length;i++){
      var t=ts[i];
      if(t.tagName=="TEXTAREA" && t.value==v){
        t.style.tabSize=m;
      }else if(t.tagName=="PRE" && t.innerText==v){
        t.style.tabSize=m;
      }
    }
    return m
  },
  _getNewClass:function(v1,nv){
    v1=v1||"";
    v1=v1.split(" ");
    if(!nv || nv.constructor!=String){
      nv="";
    }

    nv=nv.split(" ");
    for(var n=0;n<v1.length;n++){
      var i=nv.indexOf(v1[n]);
      if(i>=0){
        nv.splice(i,1);
      }
    }
    return nv;
  },
  _formatAgo:function(t){
    t=Math.round((Date.now()-t)/1000);
    var m=_bzMessage._system._info
    if(t<60){
      m=m._secondAgo
    }else{
      t=Math.round(t/60)
      if(t<60){
        m=m._minuteAgo
      }else{
        t=Math.round(t/60)
        if(t<24){
          m=m._hourAgo
        }else{
          t=Math.round(t/24)
          if(t<7){
            m=m._dayAgo
          }else{
            if(t<30){
              t=Math.round(t/7)
              m=m._weekAgo
            }else if(t<365){
              t=Math.round(t/30)
              m=m._monthAgo
            }else{
              t=Math.round(t/365)
              m=m._yearAgo
            }
          }
        }
      }
    }
    return _Util._formatMessage(m,[t,t>1?"s":""])
  },
  _formatTimestamp:function(t,f){
    t=t||Date.now()
    if(t.constructor==String&&!$.isNumeric(t)){
      f=t
      t=Date.now()
    }
    t=parseInt(t)
    f=f||"MM-dd hh:mm";
    var d=new Date(t);
    var mp={
      y:d.getFullYear()+"",
      M:_Util._formatNumberLength(d.getMonth()+1),
      d:_Util._formatNumberLength(d.getDate()),
      h:_Util._formatNumberLength(d.getHours()),
      m:_Util._formatNumberLength(d.getMinutes()),
      s:_Util._formatNumberLength(d.getSeconds())
    }
    for(var k in mp){
      var r= new RegExp("["+k+"]+"),
          v=mp[k]
      
      r=f.match(r)
      if(r){
        r=r[0]
        if(k=="y"){
          v=v.substring(v.length-r.length)
        }else if(r.length==1){
          v=parseInt(v)+""
        }
        f=f.replace(r,v)
      }
    }
    return f
  },
  _selectText:function(o) {
    if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(o);
      range.select();
    } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(o);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
  },
  _getTopZIndex:function(_curDom){
    _curDom=_curDom||document.body
    var os=$(_curDom.ownerDocument).find("*"),zz=100;
    for(var i=0;i<os.length;i++){
      var o=os[i];
      try{
        var z=parseInt($(o).css("z-index"))||0;
        if(z>=zz && z<100000 && !$(o).hasClass("bz-modal-bg")){
          zz=z+1;
        }
      }catch(e){}
    }
    if(zz<=100){
      zz=200;
    }
    return zz;
  },
  _setToTop:function(_curDom){
    // if($(".bz-bg").find(_curDom).length){
      // return
    // }
    var z=this._getTopZIndex(_curDom)||200;
    var zz=parseInt($(_curDom).css("z-index"))||200;
    if(!zz || z>zz){
      $(_curDom).css({"z-index":z})
    }
  },
  _findTextBox:function(v,_fun){
    v=v.trim()
    v=v.split(":")
    let _tag="",_content=v[1]||v[0],vs;
    if(v[1]){
      _tag=v[0]
    }
    
    vs=$(_tag+":Contains("+_content+")").toArray()
    if(!_tag){
      let os=[]
      vs.forEach((x,i)=>{
        if(!x.children.length||!vs[i+1]||!$(x).find(vs[i+1])[0]){
          os.push(x)
        }
      })
      vs=os.map(x=>{
        while(x.parentElement){
          p=x.parentElement
          if(_fun($util.getElementText(p).replace(/\:/g," ").trim(),_content)){
            x=p
          }else{
            break
          }
        }
        return x
      })
    }

    return vs
  },
  _setDrag:function(_handlers,_curDom, _except,_fun){
    _curDom._position=$(_curDom).css("position")
    let _nsSlider=$(_curDom).css("cursor")=="row-resize"
    let _ewSlider=$(_curDom).css("cursor")=="col-resize"
    var _dPos,_mPos,_dSize,_tmpMouseMove,_tmpMouseUp,_tmpSelect,
        _uiSwitch=BZ._data._uiSwitch;
    for(var i=0;i<_handlers.length;i++){
      var h=_handlers[i];
      if(!h){
        continue;
      }
      h.onmousedown=function(e){
        _Util._setToTop(_curDom);
        let c=this.parentElement.getBoundingClientRect(),
            r=this.getBoundingClientRect()
        // $(this).css({position:"fixed"})
        if(_ewSlider){
          $(this).css({top:c.top+"px",height:c.height+"px",left:r.left+"px"})
        }else if(_nsSlider){
          console.log("left:"+c.left+", top:"+r.top)
          $(this).css({left:c.left+"px",width:c.width+"px",top:r.top+"px"})
        }

        if(_curDom._data&&_curDom._data._noMoveable){
          return
        }
        if(_Util._isEventElement(e.target)){
          return;
        }
        if(_except){
          if(_except.constructor==String){
            if($(_except).find(e.target).length||$(_except).is(e.target)){
              return;
            }
          }else{
            for(var i=0;i<_except.length;i++){
              if(_except[i]==e.target || $(_except[i]).find("*").is(e.target)){
                return;
              }
            }
          }
        }
        _uiSwitch._inHandleSize=1
        
        
        _mPos=_Util._getMouseXY(e);
        _dPos=_Util._getDomXYForDrag(_curDom);
        _dSize=_Util._getDomSize(_curDom);
        
        if(this.ownerDocument.onmousemove!=_mousemove){
          _tmpMouseMove=this.ownerDocument.onmousemove;
        }
        
        if(this.ownerDocument.onmouseup!=_mouseup){
          _tmpMouseUp=this.ownerDocument.onmouseup;
        }
        if(this.ownerDocument.body.onselectstart!=_selectText){
          _tmpSelect=this.ownerDocument.body.onselectstart;
        }
        
        this.ownerDocument.onmousemove=_mousemove;
        this.ownerDocument.onmouseup=_mouseup;
        this.ownerDocument.body.onselectstart=_selectText;
      }
    }
    var _mousemove=function(e){
      if(_uiSwitch._inHandleSize && e.buttons){
        var _newMPos=_Util._getMouseXY(e);
        var x=_newMPos.x-_mPos.x+_dPos.x
        var y=_newMPos.y-_mPos.y+_dPos.y
        var _hSize=50;
        var ww=_curDom.ownerDocument.defaultView.innerWidth;
        var wh=_curDom.ownerDocument.defaultView.innerHeight;
        $(_curDom).css({transform:"unset"})
        if(x>0 && x+_hSize<ww&& y>0 && y+_hSize<wh){
          return _setNewPos(_curDom,x,y)
        }
        if(x>0 && x+_hSize>ww){
          x=ww-_hSize;
        }
        if(y>0 && y+_hSize>wh){
          y=wh-_hSize;
        }
        if(x<0){
          x=0;
        }
        if(y<0){
          y=0;
        }
        return _setNewPos(_curDom,x,y)
      }else if(_uiSwitch._inHandleSize){
        this.onmouseup()
      }
    };
    var _mouseup=function(e){
      _uiSwitch._inHandleSize=0;
      this.onmousemove=_tmpMouseMove;
      this.onmouseup=_tmpMouseUp;
      this.body.onselectstart=_tmpSelect;
      
      $(_curDom).css({position:_curDom._position})
      if(_nsSlider){
        $(_curDom).css({width:"100%"})
      }
      var _newMPos=_Util._getMouseXY(e);
      _fun&&_fun(_newMPos.x,_newMPos.y,_curDom,1)
    }
    
    function _setNewPos(o,x,y){
      if(!_fun||_fun(x,y,o)){
        if(_nsSlider){
          $(o).css({top:y+"px"});
        }else if(_ewSlider){
          $(o).css({left:x+"px"});
        }else{
          $(o).css({left:x+"px",top:y+"px"});
        }
      }
    }
    
    var _selectText=function(){return false};
    setTimeout(function(){
      _Util._setToTop(_curDom);
    },100)
  },
  _setDragDrop:function(_curDom,_selector,_area,_befFun,_AftFun,_diff){
    if(!_curDom){
      return;
    }
    var _mPos,_dPos,_inDraging,_scrollTop;
    var _tmpDiv;
    _diff=_diff||0;
    _curDom.onmousedown=function(e){
      if(["INPUT","TEXTAREA","BUTTON","PRE"].includes(e.target.tagName)){
        return
      }
      if((!_tmpDiv || !_tmpDiv.length || !_tmpDiv[0].children.length) && this.childNodes[0]){
        _tmpDiv=$(_curDom.childNodes[0].outerHTML);
        _tmpDiv.css({border:"1px dashed blue","background-color":"rgba(0, 50, 255, 0.07) !important;"});
        _tmpDiv.find("*").css({border:"1px dashed blue","background-color":"rgba(0, 50, 255, 0.07) !important;"});
        _tmpDiv.find("*").text("")
      }
      _mPos=_Util._getMouseXY(e);
      _scrollTop=_area.scrollTop-_diff;
      _dPos=_Util._getDomXYForDrag(_curDom);
      _curDom.onmousemove=function(e){
        if(!e.buttons){
          _inDraging=0
          return;
        }
        if(!_inDraging){
          if(_befFun){
            _befFun(this)
          }
//            $(this).on("selectstart","*",function(){return false});
        }
        var _curPos=_Util._getMouseXY(e);
        var dx=_mPos.x-_curPos.x;
        var dy=_mPos.y-_curPos.y;
        var os=$(_curDom).find(_selector);
        if(os.length && (dx>5 || dx<-5 || dy>5 || dy<-5 || _inDraging)){
          _inDraging=true;
          
          os.css({position:"fixed",width:os.parent().css("width")});
          _tmpDiv.css({position:""});
          var _last=null;
          var _moveItems=[];
          for(var i=0;i<os.length;i++){
            var o=os[i];
            _moveItems.push(o)
            if(i==0){
              _last=o;
              $(o).css({top:_curPos.y-10,left:_curPos.x-_mPos.x});
            }else{
              _size=_Util._getDomSize(_last);
              $(o).css({
                top:parseInt(_last.style.top)+_size._height,
                left:parseInt(_last.style.left)
              });
              _last=o;
            }
          }
          
          for(var i=0;i<_curDom.childNodes.length;i++){
            var o=_curDom.childNodes[i];
            if(!_moveItems.includes(o)){
              var _oPos=_Util._getDomXYForDrag(o);
              var _oSize=_Util._getDomSize(o);
              if((_oPos.y<_curPos.y && _oPos.y+_oSize._height>_curPos.y) || (i==_curDom.childNodes.length-1 && _oPos.y+_oSize._height<_curPos.y)){
                if(_oPos.y+_oSize._height/2>_curPos.y){
                  _tmpDiv.insertBefore(o);
                }else{
                  _tmpDiv.insertAfter(o);
                }
//                console.log("------------------------")
//                console.log(_moveItems[0]);
//                console.log(_tmpDiv[0]);
//                console.log(o)
//                console.log("========================")
                return;
              }
            }
          }
        }
      }
      var _tmpDocMouseUp=_curDom.ownerDocument.onmouseup;
      _curDom.ownerDocument.onmouseup=function(e){
        if(_inDraging){
          _inDraging=0;
          if($(_curDom).find(_tmpDiv).length){
            $(_curDom).find(_selector).insertAfter(_tmpDiv);
            $(_curDom).find(_selector).css({position:""});
            _tmpDiv.remove();
          }
          if(_AftFun){
            _AftFun(this)
          }
        }
        _curDom.ownerDocument.onmouseup=_tmpDocMouseUp;
        _curDom.onmousemove=null;
      }
    };
  },
  _checkJQueryEvent:function(e){
    try{
      return $["_"+"data"](e,"events") || {};
    }catch(e){}
    return {};
  },
  _loadInHash:function(_url,_location){
    /*
    var _list=[_location.protocol,"/"+"/",_location.host,_location.pathname];
    for(var i=0;i<_list.length;i++){
      var v=_list[i];
      if(_url.startsWith(v)){
        _url=_url.substring(v.length);
      }
    }
    */
    return _url.startsWith(_location.origin+_location.pathname+"#");
  },
  _getStackTrace:function() {
    var obj = {};
    Error.captureStackTrace(obj, _Util._getStackTrace);
    return obj.stack;
  },
  _clone:function(o){
    if($.type(o)=="array"){
      return $.extend(true,[],o);
    }else if($.type(o)=="object"){
      return $.extend(true,{},o);
    }
    return o;
  },
  _simpleClone:function(o){
    if(o){
      let n={}
      if(o.constructor==Array){
        n=[]
      }else if(o.cloneNode){
        return o.cloneNode()
      }else if(o.constructor!=Object){
        return o
      }

      for(var k in o){
        n[k]=o[k]
      }
      return n
    }
    return o
  },
  _getSimpleJson:function(o){
    var d;
    if(o!==null&&o!==undefined){
      if(o.constructor==Object){
        d=Object.keys(o).length&&{}||undefined
      }else if(o.constructor==Array){
        d=o.length&&[]||undefined
      }else{
        return o===""?undefined:o
      }
      
      for(var i in o){
        var v=_Util._getSimpleJson(o[i])
        if(v!==undefined&&v!==null){
          d[i]=v
        }
      }
    }
    return d
  },
  _cloneSelectData:function(d,_ignore,_only){
    var dd={}
    for(var k in d){
      if(_only && k.match("^("+_only+")$")){
        dd[k]=d[k]
      }else if(_ignore && k.match("^("+_ignore+"$)")){
        
      }else if(!_only){
        dd[k]=d[k]
      }
    }
    return dd;
  },
  _setEscWindow:function(w){
    if(_Util._checkBrowserType().name=="ie"){
      if(w.document){
        w.document.onkeydown=_Util._escCloseWindow;
        w.document.tagWin=w;
      }else{
        this.tmpPopWin=w;
        setTimeout("_Util._setEscWindow(_Util.tmpPopWin)",100);
      }
    }else{
      w.onkeydown=_Util._escCloseWindow;
      w.tagWin=w;
    }
  },
  _formatMessage:function(_msg,_value){
    if(_value&&_value.constructor!=Array){
      _value=[_value]
    }
    _msg=(_msg||"")+""
    for(var i=0;_value && i<_value.length;i++){
      var s=new RegExp("\\{"+i+"\\}","g");
      _msg=_msg.replace(s,_value[i])
    }
    return _msg;
  },
  _escCloseWindow:function(e){
    if(e==undefined){
      e=null;
    }
    var k = _Util._checkKeycode(e);
    if(k==27){
      let os=$(e.srcElement.ownerDocument).find(".bz-modal-window .btn-cancel:last")
      if(os.length){
        os.click()
        return
      }
      try{
        this.tagWin.close();
      }catch(e){
      }
    }
  },
  _setFindDomJS:function(o){
    let s="document"
    let _bzPath=_Util._clone(o.bzTmp)
    
    if(_bzPath.find(x=>x=="shadowRoot")){
      while(_bzPath.length){
        let v=_bzPath.shift()
        if(!v||$.isNumeric(v)||v.includes("BZ.TW.document")){
          continue
        }
        if(v=="shadowRoot"){
          s+=_findShadowPath(_bzPath,document,o)
        }else{
          let t=v.split(/[:\[\.\#]/)[0]
          s+=_findElementPath(t,_bzPath,document,o)
        }
        break
      }
    }else{
      let os=document.getElementsByTagName(o.tagName)
      for(let i=0;i<os.length;i++){
        if(os[i]==o){
          s=`document.getElementsByTagName('${o.tagName}')[${i}]`
          break
        }
      }
    }

    o._jsPath=s

    function _findShadowPath(p,_root,o){
      let t=p.shift()
      t=t.split(/[:\[\.\#]/)[0]
      for(let i=0;i<_root.children.length;i++){
        let oo=_root.children[i]
        if(oo.getElementsByTagName(t).length){
          let s=_findElementPath(t,_Util._clone(p),oo,o)
          if(s){
            return ".children["+i+"]"+s
          }
        }
      }
    }
    
    function _findElementPath(_tagName,p,_root,o){
      let os=_root.getElementsByTagName(_tagName)
      let tt=p.shift(),s=`.getElementsByTagName("${_tagName}")`
      
      for(let i=0;i<os.length;i++){
        let oo=os[i]
        if(tt){
          if(tt=="shadowRoot"){
            if(oo.shadowRoot){
              let ss=_findShadowPath(_Util._clone(p),oo.shadowRoot,o)
              if(ss){
                return `${s}[${i}].shadowRoot${ss}`
              }
            }
          }else{
            tt=tt.split(/[:\[\.\#]/)[0]
            let ss=_findElementPath(tt,_Util._clone(p),oo,o)
            if(ss){
              return `${s}[${i}].getElementsByTagName("${_tagName}")[${i}]${ss}`
            }
          }
        }else if(o==oo){
          return `${s}[${i}]`
        }
      }
    }
  },
  _swapKeyValue:function(_json){
    var _result = {};
    for(var _key in _json){
      _result[_json[_key]] = _key;
    }
    return _result;
  },
  _isHidden:function(o,_bParent,_chkBZElement){
    if(!o){
      return 1;
    }
    if($(o).is(".BZIgnore")||$(".BZIgnore").find(o)[0]){
      if(!_chkBZElement){
        return 1
      }
    }
    var n=o.tagName;
    if(n){
      if(n=="INPUT" && o.type=="hidden"){
        return 1;
      }else if(n=="INPUT" && o.type=="file"){
        return _Util._isHidden(o.parentElement,1);
      }else if($(o).css("display")=="none" || (($(o).css("visibility")=="hidden"||$(o).css("opacity")==0) && !_bParent)){
        if(o.tagName=="INPUT"&&["checkbox","radio"].includes(o.type)){
          
        }else{
          return 1;
        }
      }
      if(!_bParent){
        var a=o.getBoundingClientRect();
        if(o.offsetLeft+o.offsetWidth<0 || o.offsetTop+o.offsetHeight<0){
          return 1
        }
        if(a.width<2 || a.height<2){
          if(o.innerText!=undefined && !o.innerText.trim()){
            for(var i=0;i<o.children.length;i++){
              if(!_Util._isHidden(o.children[i])){
                return 0
              }
            }
            return 1
          }
        }
      }
      /*
      var _rect=o.getBoundingClientRect();
      var _minOffsetLeft=_minOffsetTop=0;
      while(o!=o.ownerDocument.body){
        if(_minOffsetLeft>o.offsetLeft){
          _minOffsetLeft=o.offsetLeft;
        }
        if(_minOffsetTop>o.offsetTop){
          _minOffsetTop=o.offsetTop;
        }
        o=o.parentElement;
        if(!o){
          return 1;
        }
      }
      
      if(_minOffsetTop+_rect.height<=0 || _minOffsetLeft+_rect.width<=0){
        return true;
      }
      */
      if(o.tagName!="BODY"){
        return _Util._isHidden(o.parentElement,1)
      }
      return !o.ownerDocument || !o.ownerDocument.defaultView;
    }
    return 1;
  },
  _isTooSmall:function(o){
    o=o.getBoundingClientRect()
    return o.width<10||o.height<10
  },
  _moveMenu:function(v,_from){
    let r=v.getBoundingClientRect();
    if(r.bottom>window.innerHeight){
      if(r.top>r.height){
        $(v).css({top:r.top-r.height+"px"})
      }else{
        $(v).css({top:0})
      }
    }
  },
  _setTabStyle:function(o){
    if(o&&o.parentElement){
      $(o.parentElement).css({display:"unset"})
      $(o).css({width:"unset"})
      let w=o.getBoundingClientRect().width+30
      $(o).css({width:w})
      o._width=w
      $(o.parentElement).css({display:"flex"})
    }
  },
  _isOpacity:function(o){
    while(o&&o.tagName!="BODY"&&$(o).css("opacity")!=0){
      o=o.parentElement
    }
    return o.tagName!="BODY"
  },
  _scrollToTop:function(o){
    while(o.parentElement){
      o=o.parentElement
      o.scrollTop=0
      o.scrollLeft=0
    }
  },
  _focusElement:function(o){
    var r1=o.getBoundingClientRect()
    o.focus()
    var r2=o.getBoundingClientRect()
    if(r1.x==r2.x&&r1.y==r2.y){
      
      window.scrollTo(r1.x+window.scrollX-window.innerWidth/2,r1.y+window.scrollY-window.innerHeight/2)
    }
  },
  _getBackgroundColor:function(e){
    var c=$(e).css("background-color");
    if(c=="rgba(0, 0, 0, 0)"){
      return _Util._getBackgroundColor(e.parentElement)
    }
    return c
  },
  _isEqualData:function(d1,d2,_ignoreKeys,_sameKey){
    d1=d1||"";
    d2=d2||""
    if(d1.constructor==Object&&!Object.keys(d1).length){
      d1=""
    }
    if(d2.constructor==Object&&!Object.keys(d2).length){
      d2=""
    }
    if(d1.constructor==Array&&!d1.length){
      d1=""
    }
    if(d2.constructor==Array&&!d2.length){
      d2=""
    }
    if(d1&&d2&&d1.constructor==d2.constructor&&[Object,Array].includes(d1.constructor)){
      var ks=[],kk=new Set()
      if(_sameKey&&d1[_sameKey]==d2[_sameKey]){
        return 1
      }
      for(var k in d1){
        if(_ignoreKeys&&_ignoreKeys.includes(k)){
          continue
        }else if(k=="key"&&!_sameKey&&!d2.key){
          continue
        }
        kk.add(k)
        if(!_Util._isEqualData(d1[k],d2[k],_ignoreKeys)){
          return
        }
        ks.push(k)
      }
      for(var k in d2){
        if(_ignoreKeys&&_ignoreKeys.includes(k)){
          continue
        }else if(k=="key"&&!_sameKey&&!d1.key){
          continue
        }
        if(!kk.has(k)){
          if(!_Util._isEqualData(d1[k],d2[k],_ignoreKeys)){
            return
          }
        }
      }
      return 1
    }else{
      return d1==d2
    }
  },
  //check whether o1 after o2;
  _positionAfterElement:function(o1,o2){
    o1=o1.getBoundingClientRect();
    o2=o2.getBoundingClientRect();
    return o1.top>=o2.bottom || (o1.bottom>o2.top && o1.left+o1.width>=o2.right);
  },
  _getWindowFromDom:function(o){
    return o.ownerDocument.defaultView;
  },
  _scrollUpSelectedItem:function(_uiBox,_selectedUI,_diffHeight,_maxMove){
    _diffHeight=_diffHeight||0;
    if(!_uiBox || !_selectedUI){return;}
    _uiBox=$(_uiBox)[0]
    var uiBoxHeight = _uiBox.offsetHeight;
    let d1 = _selectedUI.offsetTop,
        d2=d1+_selectedUI.offsetHeight,
        d3=_uiBox.scrollTop,
        d4=d3+uiBoxHeight;
    if(d1-_diffHeight<d3||d2>d4){
      d1-=_diffHeight
      if(d1>_maxMove){
        d1=_maxMove;
      }
      _uiBox.scrollTop=d1;
      return;
    }
  },
  _selectKeyWordsInInput:function(o){
    var i1=o.value.indexOf("{")
    if(i1>=0){
      o.selectionStart=i1
      var i2=o.value.indexOf("}")+1
      if(i2){
        o.selectionEnd=i2
      }
    }
  },
  _searchValueInJSON:function(j,v,p,ks){
    p=p||""
    ks=ks||[]
    if(j&&[Object,Array].includes(j.constructor)){
      for(var k in j){
        let pk=p?p+"."+k:k
        if(j[k]==v){
          ks.push(pk)
        }else{
          _Util._searchValueInJSON(j[k],v,pk,ks)
        }
      }
    }
    return ks
  },
  _alertMessage:function(_msg){
    if(_msg.includes("The data was updated/locked by other team member")){
      debugger
    }
    if(BZ._isAutoRunning()){
      console.log("BZ-LOG:"+_msg)
      return
    }
    
    if(_bzMessage._system._error[_msg]){
      _msg=_bzMessage._system._error[_msg];
    }

    if($(".alert-msg").toArray().find(a=>{
      if(a.innerText==_msg){
        let v=$(a).attr("repeat")
        if(v){
          v=parseInt(v.split(":")[1])+1
        }else{
          v=1
        }
        $(a).attr("repeat","("+_bzMessage._api._repeat+": "+v+")")
        return 1
      }
    })){
      return
    }
    
    _msg="<div class='alert-msg'>"+_msg+"</div>"


    var _extraPara={};
    for(var i=1;i<arguments.length;i++) {
      var o=arguments[i];
      if ($.isFunction(o)) {
        _extraPara._fun=o;
      }else{
        _extraPara._exception=o;
      }
    }
    var d=_Util._clone(_Dialog),
        _winTagClass="bz-alert-window";
    d._viewDef._items[0]._attr.class+=" "+_winTagClass

    var _dialog={
      _title:_bzMessage._common._message,
      // _modal:true,
      _moveable:true,
      _destroyOnClose:true,
      _buttons:[
        {
          _title:_bzMessage._common._ok,
          _class:"btn btn-primary bz-alert-btn",
          _click:function(){
            d._close()
          }
        }
      ],
      _afterClose:function(){
        _Util._alertContent=""
        if (_extraPara._fun) {
          _extraPara._fun();
        }
      }
    };
    _msg+=_extraPara._exception?"\n\nStack:"+_extraPara._exception.stack:"";
    
    if(!BZ.TW || BZ.TW.closed || BZ.TW.focus || !BZ.TW.document.hasFocus() || _msg.indexOf("</")>0){
      if(_msg.indexOf("</")<0 && _msg.length<=50){
        _msg="<nobr>"+_msg+"</nobr>";
      }
      if(_Util._alertContent && _Util._alertContent!=_msg){
        _msg=_Util._alertContent+"\n<hr/>\n"+_msg
      }
      
      _Util._alertContent=_msg;
      var o=$("<div style='min-width:150px;max-width:100%;word-break:break-all;margin:0;float:left;white-space: pre-wrap;'></div>")
      if(_msg.includes("</html>")){
        o=o.text(_msg);
      }else{
        o=o.html(_msg);
      }
      try{
        d._showMe(o[0],_dialog,window.document.body,_winTagClass);
      }catch(e){}
    }else{
      BZ.TW.alert(_msg);
    }
  },  
  _confirmMessage:function(_msg,_btns,_title,_width,_noCancel,_cancelFun,_noModal,_body,_noMoreAsk){
    let _loading=_msg
    var d=_Util._clone(_Dialog),
        _winTagClass="bz-confirm-window";
    d._viewDef._items[0]._attr.class+=" "+_winTagClass
    let ww=window.innerWidth*0.618
    if(ww<400){
      ww=400
    }else if(_msg&&_msg.constructor==String){
      ww=Math.min(_msg.split("\n").filter(x=>x).sort((a,b)=>b.length-a.length)[0].length*8,ww)
      if(curUser.language=="cn"){
        ww*=1.5
      }
    }
    _width=(_width||ww)+"";
    if(!_width.match(/\%/)){
      _width+="px"
    }
    _btns=_btns||[]
    _btns.forEach(b=>{
      b._class=b._class||"btn-primary "+(b._exClass||"")
      b._class+=" bz-left-space-10 btn pull-right"
      b._title=b._title||_bzMessage._method._save
    })
    var _dialog=_CtrlDriver._buildProxy({
      _title:_title?_title:_bzMessage._common._confirm,
      _width:400,
      _height:200,
      _modal:!_noModal,
      _moveable:1,
      _destroyOnClose:true,
      _buttons:_noCancel&&_noCancel!='_close'?[]:[
        {
          _title:_btns.length?_bzMessage._method[_noCancel||!_btns.length?"_close":'_cancel']:_bzMessage._common._close,
          _class:"btn-cancel btn btn-secondary bz-pull-right",
          _style:function(d){
            return "margin-right:5px;"
          },
          _click:function(_this){
            if(_cancelFun){
              if(_cancelFun()===0){
                return
              }
            }
            _this._ctrl._close();
          }
        }
      ]
    });

    var _content=$("<pre class='pull-left bz-dlg-content' style='word-break: break-word;white-space: pre-wrap;max-width:100%;width:100%;margin: 0;'></pre>")
    
    try{
      if(!_body&&window.event&&window.event.target){
        _body=window.event.target.ownerDocument.body
      }
    }catch(e){}
    if(!_body){
      _body=window.document.body
    }
  
    if(_msg.constructor==String){
      _content.html(_msg); 
    }else if(_msg.constructor==Object){
      _msg=_CtrlDriver._execute({},{},_msg,_body);
      _content.append(_msg); 
    }else{
      _content.append(_msg); 
    }
    if(_noMoreAsk){
      _content.append("<label style='display:block;margin:20px 0;'><input type='checkbox' onclick='this.checked?localStorage.setItem(\"BZ:"+_noMoreAsk+"\",1):localStorage.clear()'/>"+_bzMessage._system._info._noMoreAsk+"</label>")
    }
    _content.css({opacity:0,position:"fixed"})
    $(_body).append(_content[0]);
    // $(document.body).append(_content[0]);
    var dm=_Util._getDomSize(_content[0]);
    _dialog._width=_width
    
    _dialog._height=parseInt(dm._height)+150;
    if(_dialog._height>700){
      _dialog._height-=10
    }
    _btns.forEach(b=>{
      b&&_dialog._buttons.unshift(b);
    })
    _dialog=d._showMe(_content[0],_dialog,_body,_winTagClass);
    _content.css({opacity:1,position:"unset"})
    //_Util._resizeModelWindow(_dialog,_body.ownerDocument)
    _waitExe()
    _chkSize()
    function _waitExe(i){
      var _timer=$(_body).find(".bz-dlg-timmer-btn")
      if(_timer[0]){
        var s=_timer.find(".bz-second-num")[0]
        if(!s){
          s=$(_body).find("<span class='bz-second-num'> (31 s)</span>")[0];
          _timer.append(s)
        }
        var v=parseInt(s.innerText.substring(2))-1
        if(!v){
          return _timer.click()
        }
        s.innerText=" ("+v+" s)"
        setTimeout(_waitExe,1000)
      }
    }

    function _chkSize(){
      if(_loading&&_loading._load){
        return setTimeout(()=>{
          _chkSize()
        },100)
      }
      _Util._resizeModelWindow(_dialog,_body.ownerDocument)
    }
  },
  _setMoveWindow:function(_noMove){
    $(".bz-modal-window").toArray().forEach(o=>{
      if(o._data){
        o._data._noMoveable=_noMove
      }
    })
  },
  _closeModelWindow:function(e){
     setTimeout(function(){
      if($(".bz-large-editor")[0]){
        $(".bz-textarea-ctr").click()
      }else if($(".bz-large")[0]){
        $(".bz-ui-switch").click()
      }else{
        while(_dialogList.find((v,i)=>{
          if(v&&!v._noEsc){
            if(!e||(e.target&&(e.target==document.body||v._isSameDlg(e.target)))||$(v).find(e)){
              v._close()
              return v
            }
          }
        })&&Date.now()-_lastCloseDlgTime<50){}
        _lastCloseDlgTime=Date.now()
     }
   },10)
  },
  _gotoPageFromModelWindow:function(v,o){
    BZ._setHash(v)
    _Util._closeModelWindow(o)
  },
  _gotoPageFromModelWindow:function(v,o){
    BZ._setHash(v)
    _Util._closeModelWindow(o)
  },
  _resizeModelWindow:function(o,_doc){
    clearTimeout(_Util._resizeWindowTimer)
    _Util._resizeWindowTimer=setTimeout(function(){
      _doc=_doc||window.document
      let os=$(_doc).find(".bz-modal-window").toArray()
      if(o){
        o=os.find(oi=>{
          return $(oi).find(o).length
        })
        _doIt(o)
      }else{
        os.forEach(o=>{
          _doIt(o)
        })
      }
    },10)
    
    function _doIt(o,i){
      i=i||0
      o=$(o)
      let v=o.find(".bz-dlg-content")[0]
      if(v){
        let r=o[0].getBoundingClientRect(),
            wh=_doc.defaultView.innerHeight,_resize;

        if(r.top>wh-r.bottom){
          _resize=wh-r.bottom>20
        }

        o.css({height:"100px"})
        o.css({height:100+v.scrollHeight-v.getBoundingClientRect().height+40+"px"})
        if(!v.innerText&&i<10&&v.getBoundingClientRect().height<10){
          return setTimeout(()=>{
            _doIt(o,i+1)
          },100)
        }
        if(_resize){
          r=o[0].getBoundingClientRect()
          if(r.top>wh-r.bottom){
            if(wh-r.bottom<20){
              o.css({top:r.top-20+wh-r.bottom+"px"})
            }
          }
        }
      }
    }
  },
  _getEndElementsByWord:function(_judgeFun,o,_inHidden,_checkingElement){
    o=$(document.body).find(o).toArray()
    let _last,_hiddens=[];;

    for(let i=0;i<o.length;i++){
      let x=o[i]
      if(_last&&$(_last).find(x)[0]){
        if(_hiddens.includes(_last)){
          if(_judgeFun(x.innerText)){
            _hiddens.push(x)
          }
        }
        o.splice(i--,1)
      }else if(!_judgeFun(x.innerText)){
        o.splice(i--,1)
        _last=x
      }else if(_Util._isHidden(x)){
        _hiddens.push(x)
        o.splice(i--,1)
        _last=x
      }else{
        _last=0
      }
    }
    if(_inHidden){
      _doIt(_hiddens)
      return _hiddens
    }else{
      _doIt(o)
      if(o.length){
        return o
      }
      _doIt(_hiddens)
      return _hiddens
    }
    function _doIt(o){
      _last=o[o.length-1]

      for(let i=o.length-2;i>=0;i--){
        if(!_Util._isCellElement(o[i])&&$(o[i]).find(_last)[0]){
          o.splice(i,1)
        }else{
          _last=o[i]
        }
      }
      // _Util._spliceAll(o,x=>{
        // if(!_Util._isCellElement(x)){
          // for(let i=0;i<x.childNodes.length;i++){
            // let n=x.childNodes[i]
            // if(n.nodeType==3&&_judgeFun(n.textContent||"")){
              // return
            // }
          // }
          // return 1
        // }
      // })
    }
    return o
  },
  //for shadowRoot
  _getRootDom:function(o){
    while(o.parentElement&&o.tagName!="BODY"){
      o=o.parentElement
    }
    return o
  },
  _getElementsByWord:function(_judgeFun,o,_inHidden,_root){
    if(o=="BODY"){
      o=[_root||document.body]
    }else{
      o=$(_root||document.body).find(o).toArray()
    }
    let _last,_hiddens=[];

    for(let i=0;i<o.length;i++){
      let x=o[i]
      if(_last&&$(_last).find(x)[0]){
        if(_hiddens.includes(_last)){
          if(_judgeFun(x.innerText)){
            _hiddens.push(x)
          }
        }
        o.splice(i--,1)
      }else if(!_judgeFun(x.innerText)){
        o.splice(i--,1)
        _last=x
      }else if(_Util._isHidden(x)){
        _hiddens.push(x)
        o.splice(i--,1)
        _last=x
      }else{
        _last=0
      }
    }
    if(_inHidden||!o.length){
      return _hiddens
    }
    return o
  },
  _isStdInputElement:function(v){
    return this._isInputTag(v.tagName) && !["image","button","reset","submit","hidden"].includes(v.type);
  },
  _isEventElement:function(v){
    return _Util._isInputObj(v)||$("[contenteditable=true]").find(v)[0]|| ["OPTION","BUTTON","A"].includes(v.tagName)
  },
  _isCellElement:function(v){
    return _Util._isEventElement(v)
  },
  _isInputTag:function(v){
    return ["INPUT","SELECT","TEXTAREA"].includes(v);
  },
  _popWin:function(url,name,_win,_width,_height,_viewDef,_title){
    var w=_width || screen.availWidth*0.50;
    var h=_height || screen.availHeight*0.50;
    var l=(screen.availWidth-w)/2;
    var t=(screen.availHeight-h)/2;
    if(!_win){
      _win=window;
    }
    w=_win.open(url,name,"width="+w+",height="+h+",left="+l+",top="+t+",resizable=yes");
    
    var d=w.document;
    w.focus();
    var _host=SERVER_HOST;
    if(bzTwComm._isExtension()&&_host.match(/^\/\/[0-9\.]+$/)){
      _host="/"+"/ai.boozang.com"
    }

    //Setup css
    if(_Util._style){
      d.write("<style>"+_Util._style+"</style>")
    }else{
      d.write("<link rel='stylesheet' type='text/css' href='"+_host+"/ide/css/js-editor.css'>");
      d.write("<link rel='stylesheet' type='text/css' href='"+_host+"/ide/css/main.max.css'>");
      d.write("<link rel='stylesheet' type='text/css' href='"+_host+"/ide/css/main.icons.css'>");
    }
    d.write("<style>input{font-family: Courier;}\n#_content span{color:blue;}\nul input{border: 0;margin: 2px;}</style>");

    d.write("<link type='image/x-icon' href='"+_host+"/favicon.ico'>");
    d.write("<body style='min-width:unset;overflow:hidden;' class='bz-pop-win'></body>");

    w.BZ=BZ;

    w._IDE=_IDE;
    w._Util=_Util;
    w.$util=$util
    w.root=null;    
    w.$=$;
    
    _Util._handlePrePanel(d)
    
    _Util._setEscWindow(w);
    d.title="BZ - "+_title

    _CtrlDriver._execute({},{},_viewDef,d.body);

    d.insertBefore(d.implementation.createDocumentType('html','',''), d.childNodes[0]);

    return w
  },
  _checkKeycode:function(e) {
    var _keycode;
    if (window.event) {
      _keycode = window.event.keyCode;
    }else if (e) {
      _keycode = e.which;
    }
    return _keycode;
  },
  _checkCharcode:function(e) {
    e=e||window.event;
    var _keycode=0;
    if (e) {
      _keycode = e.charCode;
    }
    if(!_keycode && e && e.key && e.key.length==1){
      _keycode=e.key.charCodeAt(0)
    }
    return _keycode;
  },
  _getDomXYForDrag:function(obj){
    let _nsSlider=$(obj).css("cursor")=="row-resize"
    let _ewSlider=$(obj).css("cursor")=="col-resize"
    if(obj.defaultView){
      return {x:0,y:0};
    }
    var o=obj.getBoundingClientRect()
    var x=o.x,
        y=o.y,
        t=$(obj).css("transform");
    if(!t||t=="none"){
      if(_nsSlider){
        $(obj).css({top:y+"px"})
      }else if(_ewSlider){
        $(obj).css({left:x+"px"})
      }else{
        $(obj).css({left:x+"px",top:y+"px"})
      }
      o=obj.getBoundingClientRect()
      var x1=o.x,
          y1=o.y;
      
      if(x1!=x||y1!=y){
        x=x+x-x1
        y=y+y-y1
        if(_nsSlider){
          $(obj).css({top:y+"px"})
        }else if(_ewSlider){
          $(obj).css({left:x+"px"})
        }else{
          $(obj).css({left:x+"px",top:y+"px"})
        }
      }
    }
    return {"x":x, "y":y};    
  },
  _getDomXY:function(obj){
    if(obj.defaultView){
      return {x:0,y:0};
    }
    
    var _box = obj.getBoundingClientRect();
    
    if((_box.width==0||_box.height==0)&&(_box.left==0&&_box.top==0)){
      if(_cssHandler._isInShadowDom(obj)){
        _box=obj.parentElement.getBoundingClientRect()
      }
    }
    return {"x":_box.left, "y":_box.top};
  },
  _trimSpace:function(v){
    return v.trim().replace(/\s+/g," ");
  },
  _BZContentToFormatedHtml:function(_view,_step){
    if(_view.tag){
      var _attr=""
      if(_view.id){
        _attr=" id=\""+_view.id+"\"";
      }
      if(_view.tagAttr){
        for(var k in _view.tagAttr){
          _attr+=" "+k+"=\""+_view.tagAttr[k]+"\"";
        }
      }
      var s=_step+"<"+_view.tag+_attr+">\r";
      var v="";
      if(_view.items){
        for(var i=0;i<_view.items.length;i++){
          var vv=_view.items[i];
          v += _Util._BZContentToFormatedHtml(vv,_step+"  ");
        }
      }
      var e=_step+"</"+_view.tag+">\r";
      return s+v+e;
    }else{
      return _step+_view.html+"\r";
    }    
  },  
  _getParentNode:function(_dom,_tag){
    while(_dom.parentNode){
      _dom=_dom.parentNode;
      if(_dom.tagName==_tag){
        return _dom;
      }else if(_dom.tagName=="HTML"){
        return null;
      }
    }
  },
  _objToArray:function(o){
    let a=[];
    Object.keys(o||{}).forEach(x=>{
      a.push({key:x,value:o[x]})
    })
    return a
  },
  _arrayToObj:function(a,k,v){
    let o={};
    k=k||"key";
    v=v||"value";
    (a||[]).forEach(x=>{
      let kk=x[k]
      if(kk===undefined&&!_Util._isObjOrArray(x)){
        kk=x
      }
      o[kk]=x[v]
    });
    return o
  },
  _getMouseOnChild:function(e,_pos){
    var os=e.children,o;
    for(var i=0;i<os.length;i++){
      o=os[i]
      if(!_Util._isHidden(os[i])){
        var e=o.getBoundingClientRect()
        if(_pos.x>=e.left&&_pos.y>=e.top&&_pos.x<=e.right&&_pos.y<=e.bottom){
          if(!$(o).hasClass("BZIgnore")){
            return o
          }
        }else if(o.children){
          var oo=_Util._getMouseOnChild(o,_pos)
          if(oo){
            return oo
          }
        }
      }
    }
  },
  _getMouseOnParent:function(e,_pos){
    while(e.parentElement){
      var o=e.getBoundingClientRect()
      if(_pos.x>=o.left&&_pos.y>=o.top&&_pos.x<=o.right&&_pos.y<=o.bottom){
        return e
      }
      e=e.parentElement
    }
  },
  _getMouseXY:function(e) {
    var _posx = 0;
    var _posy = 0;
    var _doc=e.target.ownerDocument;
    if (e.pageX || e.pageY)   {
      _posx = e.pageX;
      _posy = e.pageY;
    }else if (e.clientX || e.clientY)   {
      _posx = e.clientX;
      _posy = e.clientY;
    }
    _posx -= _doc.scrollingElement.scrollLeft;
    _posy -= _doc.scrollingElement.scrollTop;
    return {x:_posx,y:_posy};
  },
  _convertObj:function(v){
    if(!v){
      return v;
    }
    v=JSON.stringify(v);
    v=_compressJSON._convertToEntities(v);
    return JSON.parse(v);
  },
  _unConvertObj:function(v){
    if(!v){
      return v;
    }
    v=JSON.stringify(v);
    v=_compressJSON._unConvert(v);
    return JSON.parse(v);
  },
  _chkExistDataAttr:function(d,as){
    as.find(a=>{
      if(d[a]){
        if(d[a].constructor==Array){
          return d[a].length
        }else if(d[a].constructor==Object){
          return Object.keys(d[a]).length
        }
        return 1
      }
    })
  },
  _getDomSize:function(_dom){
    var _tmp=false;
    if(!_dom.parentElement){
      _tmp=$("<div></div>").appendTo(document.body)
      $(_dom).appendTo(_tmp);
    }
    var _size={_width:_dom.offsetWidth,_height:_dom.offsetHeight};
    if(_tmp){
      $(_tmp).remove();
    }
    return _size;
  },
  _isNumber:function(v){
    try{
      if(!isNaN(parseFloat(v))){
        return v+""==parseFloat(v)+"";
      }
    }catch(e){
    }
    return false;
  },
  _getScreenXYByClientXY:function(w,x,y){
    x+=4;
    y+=54;
    return {x:x,y:y};
  },
  _getSouElementFromEvent:function(_event,_window){
    if(!_event){
      _event=_window.event;
    }
    if(_event){
      if(_event.srcElement){
        return _event.srcElement;
      }else{
        return _event.target;
      }
    }
    return null;
  },
  _formatInnerText:function(v){
    v=v.replace("\r","\n");
    var vs=v.split("\n");
    var rv="";
    for(var i=0;i<vs.length;i++){
      v=this._replaceAll(vs[i].trim(),/  /g," ");
      if (v) {
        rv+=v+"\n";
      }
    }
    return rv.trim();
  },
  _replaceLast:function(w,r,s){
    if(s=="."){
      s="\\."
    }
    return w.replace(new RegExp(s+"[^"+s+"]+$"),r)
  },
  _replaceAll:function(w,r,v){
    var ww =w.replace(r,v);
    if (ww!=w) {
      return this._replaceAll(ww,r,v);
    }else{
      return ww;
    }
  },
  _isFunIgnoreInBrowser:function(n){
    for(var i=0;i<n.length;i++){
      if(_Util._checkBrowserType().name.includes(n)){
        return 1
      }
    }
  },
  _checkBrowserType:function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:"ie",version:(tem[1] || "")};
    }
    if(M[1]=== "Chrome"){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return {name:tem.slice(1).join(" ").replace("OPR", "Opera")};
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, "-?"];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return {name:M[0],version:M[1],letterWidth:M[0]=="firefox"?9:8};
  },
  _downloadFile:function(_name,_content,_type){
    if(_Util._checkBrowserType().name=="ie"){
      var blobObject = new Blob([_content],_type?{type:_type}:undefined); 
      
      window.navigator.msSaveBlob(blobObject, _name);
    }else{
      var a=$("<a></a>");
      $(document.body).append(a[0]);
      a.attr("download",_name).attr("href","data:application/octet-stream," + encodeURIComponent(_content))[0].click();
      a.remove();
    }
  },
  _downloadAsHtmlFile:function(_name,_content){
    if(!_content.startsWith("<!DOCTYPE html>")){
      _content="<!DOCTYPE html><html><header><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'></header><body>"+_content+"</body></html>"
    }
    if(_Util._checkBrowserType().name=="ie"){
      var blobObject = new Blob([_content]); 
      
      window.navigator.msSaveBlob(blobObject, _name);
    }else{
      var a=$("<a></a>");
      $(document.body).append(a[0]);
      a.attr("download",_name).attr("href","data:application/octet-stream," + encodeURIComponent(_content))[0].click();
      a.remove();
    }
  },
  //w: doc content 
  //n: file name
  _downloadAsWordFile:function(_name,_content){
    let w1="http:/"+"/schemas.microsoft.com/office/2004/12/omml"
    let w2="http:/"+"/www.w3.org/TR/REC-html40"
    let _sourceHTML = `<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="${w1}" xmlns="${w2}">

      <head>
          <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:TrackMoves>false</w:TrackMoves><w:TrackFormatting/><w:ValidateAgainstSchemas/><w:SaveIfXMLInvalid>false</w:SaveIfXMLInvalid><w:IgnoreMixedContent>false</w:IgnoreMixedContent><w:AlwaysShowPlaceholderText>false</w:AlwaysShowPlaceholderText><w:DoNotPromoteQF/><w:LidThemeOther>EN-US</w:LidThemeOther><w:LidThemeAsian>ZH-CN</w:LidThemeAsian><w:LidThemeComplexScript>X-NONE</w:LidThemeComplexScript><w:Compatibility><w:BreakWrappedTables/><w:SnapToGridInCell/><w:WrapTextWithPunct/><w:UseAsianBreakRules/><w:DontGrowAutofit/><w:SplitPgBreakAndParaMark/><w:DontVertAlignCellWithSp/><w:DontBreakConstrainedForcedTables/><w:DontVertAlignInTxbx/><w:Word11KerningPairs/><w:CachedColBalance/><w:UseFELayout/></w:Compatibility><w:BrowserLevel>MicrosoftInternetExplorer4</w:BrowserLevel><m:mathPr><m:mathFont m:val="Cambria Math"/><m:brkBin m:val="before"/><m:brkBinSub m:val="--"/><m:smallFrac m:val="off"/><m:dispDef/><m:lMargin m:val="0"/> <m:rMargin m:val="0"/><m:defJc m:val="centerGroup"/><m:wrapIndent m:val="1440"/><m:intLim m:val="subSup"/><m:naryLim m:val="undOvr"/></m:mathPr></w:WordDocument></xml><![endif]-->

          <meta charset='utf-8'/>
          <title>${_name}</title>
          <style>
          @page {
            size: 4in 6in landscape;
          }
          @media print {
            html, body {
              width: 210mm;height: 297mm;
            }
          }
          page[size="A4"] {
            background: white;
            width: 21cm;
            height: 29.7cm;
            display: block;
            margin: 0 auto;
            margin-bottom: 0.5cm;
            box-shadow: 0 0 0.5cm rgba(0,0,0,0.5);
          }
tbody td:first-child,tbody td:last-child{
  text-align:center;
}
          </style>
      </head>
      <body>${_content}</body></html>`;
     
     var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(_sourceHTML);
     var _fileDownload = document.createElement("a");
     document.body.appendChild(_fileDownload);
     _fileDownload.href = source;
     _fileDownload.download = _name;
     _fileDownload.click();
     document.body.removeChild(_fileDownload);
  },
  _downloadAsPdfFile:function(title,o) {
    let w= window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
    let d=w.document,
        _txt=`<html><head><title>${title}</title></head><body>${o}</body></html>`;
    d.write(_txt);

    d.close(); // necessary for IE >= 10
    w.focus(); // necessary for IE >= 10
    setTimeout(function(){
      w.print();
      w.close();
    },100)

    return true;
  },
  _downloadAsZip:function(_files,_zipFileName,_fun){
    zip.createWriter(new zip.BlobWriter("application/zip"), function(_zipWriter) {
      _addFile(_zipWriter,0)
    }, function(_msg){
      alert(_msg)
    });

    function _addFile(_zipWriter,i){
      let f=_files[i]
      if(f){
        _zipWriter.add(f._name, new zip.BlobReader(f._data), function() {
          _addFile(_zipWriter,i+1)
        });
      }else{
        _zipWriter.close(function(blob) {
					var blobURL =URL.createObjectURL(blob);
          var _clickEvent = document.createEvent("MouseEvent");
          _clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          let _downloadButton=$("<a></a>").appendTo(document.body)[0]
          
          _downloadButton.href = blobURL;
          _downloadButton.download = _zipFileName;
          _downloadButton.dispatchEvent(_clickEvent);
					zipWriter = null;
          $(_downloadButton).remove()
				});
      }
    }
  },
  _getDomsByTagAndName:function(tag,name){
    if(BZ._autoRecording){
      return []
    }
    return BZ._documents?BZ._documents.find(tag+"[name='"+name+"']"):[];
  },
  _removeAllLinkTarget:function(){
    $("A").toArray().forEach(a=>{
      _Util._removeLinkTarget(a)
    })
  },
  _setUrlFileToInput:function(_url,e){
    _domActionTask._fetchFileDataFromURL(_url,function(v){
      BZ._setTimeout(function(){
        $util.triggerChangeEvent(e,v,1);
      },100)
    })
  },
  _removeLinkTarget:function(e){
    while(e){
      if(e.tagName=="A"){
        if($(".BZIgnore").find(e)[0]){
          return
        }
        var _target=$(e).attr("target");
        if(_target){
          if(_target!='_'+'parent'&&_target!='_'+'top'&&!_Util._getDomsByTagAndName("IFRAME",_target).length){
            $(e).attr("target","_"+"self")
          }
        }else{
          $(e).attr("target","_"+"self")
        }
        /*
        if(e.href.startsWith(location.protocol){
          var n=e.href.split("/"+"/")[1];
          var c=location.hostname;
          if(e.href.split("/"+"/")[1]!=location.hostname){
            e.href=e.href.replace("/"+"/"+e.href.split("/"+"/")[1],"/"+"/"+location.hostname)
          }
        }
        */
      }
      if(e!=e.parentElement){
        e=e.parentElement;
      }else{
        return;
      }
    }
  },
  _toKey:function(v){
    v= v?v.replace(/[^a-zA-Z0-9_.]/g,"_"):"";
    if(v && v.match(/^[0-9.]/)){
      v="_"+v;
    }
    while(v.indexOf("..")>=0){
      v=v.replace("..",".");
    }
    if(v && v[v.length-1]=="."){
      v=v.substring(0,v.length-1);
    }
    return v.toLowerCase();
  },
  /*
  _formatPeriod:function(v){
    v=parseInt(v/1000);
    var h=parseInt(v/3600);
    v-=h*3600;
    var m=parseInt(v/60);
    v-=m*60;
    
    m=m<10?"0"+m:m;
    v=v<10?"0"+v:v;
    return h?h+":"+m+":"+v:parseInt(m)?parseInt(m)+":"+v:parseInt(v)+" s";
  },
  */
  _formatNumberLength:function(v,l){
    l=l||2;
    v=v+"";
    while(v.length<l){
      v="0"+v;
    }
    return v;
  },
  _getAngularModelAttr:function(o){
    var _tmp=null;
    var _curWin=_Util._getWindowFromDom(o);
    if(_curWin.angular){
      var _scope=_curWin.angular.element(o).scope();
      if(_scope){
        for(var n=0;n<o.attributes.length;n++){
          var a=o.attributes[n];
          try{
            var _model=a.value.split(".");
            var _variable=_scope;
            for(var x=0;x<_model.length;x++){
              _variable=_variable[_model[x]];
            }
            if(_variable!=undefined || x>1){
              _tmp= a;
              if(a.name.indexOf("-model")>=0){
                break;
              }
            }
          }catch(e){}
        }
      }
    }
    return _tmp;
  },
  _retrieveFileName:function(v){
    v=v.replace(/[^-_ a-zA-Z0-9]/g,"\t").trim();
    v=v.split("\t");
    return v[v.length-2];
  },
  _retrieveCssProperty:function(e,_extra,_name){
    return window.getComputedStyle(e,_extra).getPropertyValue(_name);
  },
  _retrieveCssProperties:function(e,_extra,_names){
    if(_extra==true){
      _extra=":before"
    }else if(_extra){
      _extra=":after"
    }
    var c=window.getComputedStyle(e,_extra);
    var vs=[];
    for(var i=0;i<_names.length;i++){
      vs.push(c.getPropertyValue(_names[i]));
    }
    if(!_extra || _extra==":after"){
      return vs;
    }else{
      return vs.concat(this._retrieveCssProperties(e,_extra,_names));
    }
  },
  _pickAttrFromArray:function(vs,_name){
    var ps=[];
    for(var i=0;i<vs.length;i++){
      ps.push(vs[i][_name]);
    }
    return ps;
  },
  _getRealWord:function(o,v){
    if(o.maxLength<0){
      return v;
    }else{
      return v.substring(0,o.maxLength);
    }
  },
  _buildRefPath:function(n,k){
    var m=k.match(/[a-z_$][a-z0-9_$]*/i);
    if(m && m[0]==k){
      return n+"."+k;
    }else{
      return n+"['"+k+"']";
    }
  },
  _pickValuePath:function(d,_name){
    var ps=[];
    _name=_name||"";
    for(var k in d){
      var v=d[k];
      if(v){
        if(v.constructor==Object){
          ps.concat(this._pickObjPath(v,_name+"."+k))
        }else if(v.constructor==Array){
          
        }else{
          ps.push(_name+"['"+k+"']")
        }
      }
    }
    return ps;
  },
  _toSBC:function(v){
    var s = "",_len = (v||"").length;
    for(var i=0;i<_len;i++){
        var c = v.charCodeAt(i);
        if("“”".includes(v[i])){
          c=34;
        }else if("‘’".includes(v[i])){
          c=39;
        }
        c = (c>=0xFF01 && c<=0xFF5E)?(c - 65248) : c;
        c = (c==0x03000)?0x0020:c;
        s += String.fromCharCode(c);
    }
    return s;
  },
  _cleanObj:function(o){
    if(o){
      for(let k in o){
        delete o[k]
      }
    }
  },
  _cleanArray:function(vs){
    var v="";
    if(vs){
      for(var i=0;i<vs.length;i++){
        var v=vs[i].trim();
        if(v){
          vs[i]=v;
        }else{
          vs.splice(i,1)
        }
      }
    }
    return vs;
  },
  _getAttributeCss:function(e,v,bv){
    if(!e.attributes){
      return ""
    }
    var o;
    for(var i=0;i<e.attributes.length;i++){
      var a=e.attributes[i];
      
      if(a.value.trim() && (!v || a.value.toLowerCase().includes(v.toLowerCase()))){
        var n=a.name.toLowerCase();
        if(n.match(/title|label/)){
          o=a;
          break;
        }else if(n.includes("alt")){
          o=a;
        }else if(n=="placeholder" && !o){
          o=a;
        }else if(n=="name" && !o){
          o=a;
        }
      }
    }
    if(o && !v){
      v=o.value.split("\n")[0].trim().substring(0,50)
    }else if(o && bv){
      v=bv;
    }
    return o && v?_Util._getAttrPath(o.name,v):""
  },
  _getDataPathByValue:function(d,v){
    var r,t;
    for(var k in d){
      t=d[k];
      if([Object].includes(t.constructor)){
        r=this._getDataPathByValue(t,v);
        if(r){
          return k+"."+r
        }
      }else if(t==v){
        return k;
      }
    }
  },
  _getAllVisableElements:function(){
    let hs=[]
    let os=($(document.body).find("*").toArray().filter(x=>{
      if(["file","checkbox","radio"].includes(x.type)){
        return 1
      }
      let r=x.getBoundingClientRect()
      if(r.width&&r.height&&$(x).css("visibility")!="hidden"&&$(x).css("opacity")!=0){
        if(r.left+r.width>0&&r.top+r.height>0){
          return 1
        }else{
          let p=$(x).css("position")
          if(p=="fixed"||p=="absolute"){
            hs.push(p)
            return
          }else{
            return !$(hs).find(p)[0]
          }
        }
      }
      //&&!$(x).hasClass("BZIgnore")//&&!bs.has(x)
    }));
    return os
  },
  _clearPreEventElements:function(){
    delete _Util.preEventElements
  },
  _getAllVisableElementsInJQ:function(){
    return $(_Util._getAllVisableElements())
  },
  _preTriggerEvent:function(){
    _Util.preEventElements=new Set(_Util._getAllVisableElements())
  },
  _getDiffAfterTriggerEvent:function(_continuePreTriggerEvent,_keepPreEventElements){
    let os=_Util._getAllVisableElements();
    let ps=_Util.preEventElements
    if(_continuePreTriggerEvent){
      if(!_keepPreEventElements||!ps){
        _Util.preEventElements=new Set(os)
      }
    }else{
      delete _Util.preEventElements
    }
    if(ps){
      os=os.filter(x=>!ps.has(x))
    }else{
      return []
    }
    return os
  },
  _getNewPanelFromNewElements:function(os){
    return os.find(o=>{
      return $(o).find(os).length>os.length/2
    })
  },
  _removeEndSign:function(v){
    var w="";
    for(var i=0;i<v.length;i++){
      var vv=v[i];
      var x=this._removeSign(vv,"");
      if(x){
        v=v.substring(i)
        break;
      }
    }
    if(i==v.length){
      return v;
    }
    for(var i=v.length-1;i>=0;i--){
      var vv=v[i];
      var x=this._removeSign(vv,"");
      if(x){
        v=v.substring(0,i+1);
        break;
      }
    }
    return v;
  },
  //v: words, it will be handle
  //r: replace word
  //k: keep sign
  //like: _removeSign("abc,xyz-网站  é#è&^êë"," ","-") --> "abc xyz-网站 é è  êë"
  _removeSign:function(v,r,k,_removeUnderscroe){
    r=r||"";
    k=k||"";
    v=this._toSBC(v);
    v= v.replace(/[^\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC\s$-]/g,r); 
    if(_removeUnderscroe){
      v=v.replace("_",r)
    }
    if(!k.includes("-")){
      v=v.replace(/\-/g,r)
    }
    if(!k.includes("$")){
      v=v.replace(/\$/g,r)
    }
    if(!k.includes(" ")&&r!=" "){
      v=v.replace(/ /g,r)
    }
    
    if(r==" "){
      v=v.replace(/\s+/g,r)
    }

    return v.trim()
  },
  //output function code
  _toString:function(os,n,_mini){
    var s="{";
    for(var k in os){
      var o=os[k];
      s+=k+":"
      if(!o){
        s+=o;
      }else if(o.constructor==Function){
        s+=o.toString()
      }else{
        try{
          s+=JSON.stringify(o)
        }catch(e){
          throw e;
        }
      }
      s+=","
    }
    s=s.substring(0,s.length-1)+"};";
    if(_mini){
      s=_JSHandler._cleanCode(s)
    }
    if(n){
      s="var "+n+"="+s;
    }
    return s;
  },
  _setFun:function(o,e,f){
    o=$(window.document).find(o);
    for(var i=0;i<o.length;i++){
      o[i][e]=f;
    }
  },
  _shareArray:function(a1,a2){
    a1=a1||[];
    a2=a2||[];
    if(a1.constructor!=Array){
      a1=[a1];
    }
    if(a2.constructor!=Array){
      a2=[a2];
    }
    var a=[];
    a1.forEach(function(v){
      if(a2.includes(v)){
        a.push(v);
      }
    });
    return a;
  },
  //o: old data, n: new data
  //_ignore: ignore data function
  //p: data key path
  _getSimpleDiffInJson:function(o,n,_ignore,_diffs,p){
    _diffs=_diffs||[]
    p=p||""
    let _found;
    if(o&&n&&o.constructor==n.constructor&&[Array,Object].includes(o.constructor)){
      if(o.constructor==Array){
        if(!o.length){
          if(n.length){
            _diffs.push({
              key:p,
              from:o,
              to:n
            })
          }
        }else if(!n.length){
          _diffs.push({
            key:p,
            from:o,
            to:n
          })
        }else if(o[0].code||o[0].key){
          if(o.length==n.length){
            o.forEach((x,i)=>{
              if(!n.find((y,yi)=>{
                if((y.code&&y.code==x.code)||(y.key&&y.key==x.key)){
                  if(i!=yi){
                    _diffs.push({
                      key:p,
                      from:i,
                      to:yi,
                      order:1
                    })
                  }else{
                    _Util._getSimpleDiffInJson(x,y,_ignore,_diffs,p+"."+i)
                  }
                  return 1
                }
              })){
                _diffs.push({
                  key:p+"."+i,
                  from:x
                })
              }
            })
          }else if(o.length>n.length){
            let ds=[]
            o.forEach((x,i)=>{
              if(!n.find(y=>{
                if((y.code&&y.code==x.code)||(y.key&&y.key==x.key)){
                  _Util._getSimpleDiffInJson(x,y,_ignore,ds,p+"."+i)
                  return 1
                }
              })){
                ds.push({
                  key:p+"."+i,
                  from:x
                })
              }
            })
            ds.reverse()
            _diffs.push(...ds)
          }else{
            let ds=[]
            n.forEach((x,i)=>{
              if(!o.find(y=>{
                if((y.code&&y.code==x.code)||(y.key&&y.key==x.key)){
                  _Util._getSimpleDiffInJson(y,x,_ignore,ds,p+"."+i)
                  return 1
                }
              })){
                ds.push({
                  key:p+"."+i,
                  to:x
                })
              }
            })
            ds.reverse()
            _diffs.push(...ds)
          }
        }else if(o.length!=n.length){
          let no=o[0]||n[0]
          if(!no.key||!no.code){
            _diffs.push({
              key:p,
              from:o,
              to:n
            })
          }else{
            let _dIdx=0
            if(o.length>n.length){
              for(let k in o){
                let ds=[]
                _Util._getSimpleDiffInJson(o[k],n[parseInt(k)+_dIdx],_ignore,ds,p+"."+k)
                if(ds.length){
                  _diffs.push({
                    key:p+"."+k,
                    from:o[k]
                  })
                  _dIdx++
                  if(o.length==n.length+_dIdx+1){
                    break
                  }
                }
              }
            }else{
              for(let k in n){
                let ds=[]
                _Util._getSimpleDiffInJson(n[k],o[parseInt(k)+_dIdx],_ignore,ds,p+"."+k)
                if(ds.length){
                  _diffs.push({
                    key:p+"."+k,
                    to:n[k]
                  })
                  _dIdx++
                  if(o.length==n.length+_dIdx+1){
                    break
                  }
                }
              }
            }
          }
        }else{
          o.forEach((x,i)=>{
            _Util._getSimpleDiffInJson(x,n[i],_ignore,_diffs,p+"."+i)
          })
        }
      }else{
        for(let k in n){
          if(_ignore&&_ignore(k,p,o[k],n[k])){
            continue
          }
          _Util._getSimpleDiffInJson(o[k],n[k],_ignore,_diffs,p+"."+k)
        }
        for(let k in o){
          if(_ignore&&_ignore(k,p,n[k],o[k])){
            continue
          }
          if(!Object.keys(n).includes(k)){
            _diffs.push({
              key:p+"."+k,
              from:o[k]
            })
          }
        }
      }
    }else if(o!=n){
      _diffs.push({
        key:p,
        from:o,
        to:n
      })
    }
    return _diffs
  },
  _strToObj:function(vv){
    let v=vv||""
    if(v.constructor==String){
      v=v.trim()
      if(v.match(/(^\[.*\]$)|(^\{.*\}$)/s)){
        try{
          v=_Util._eval("v="+v)
          return v
        }catch(e){}
      }
    }
    return vv
  },
  _getDiffArray:function(a1,a2){
    var vs=[]
    for(var i=0;i<a1.length;i++){
      if(!a2.includes(a1[i])){
        vs.push(a1[i])
      }
    }
    for(var i=0;i<a2.length;i++){
      if(!a1.includes(a2[i])){
        vs.push(a2[i])
      }
    }
    return vs;
  },
  fetchBlob:function(uri, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', uri, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
      if (_Util._isAPISucessStatus(this.status)) {
        var blob = this.response;
        if (callback) {
          callback(blob);
        }
      }
    };
    xhr.send();
  },
  _mergeURL:function(r,_url){
    _url= _url||"";
    r=r.trim()
    if(r && !_url.startsWith(r) && !_url.startsWith("http") && !_url.startsWith("/"+"/")){
      if(!_url){
        _url=r
      }else if(r.endsWith("/") && _url[0]=="/"){
        _url=r+_url.substring(1);
      }else if(!r.endsWith("/") && _url[0]!="/"){
        _url=r+"/"+_url;
      }else{
        _url=r+_url;
      }
    }
    return _url
  },
  _mergeDeep:function(_target, ..._sources) {
    if (!_sources.length) return _target;
    const _source = _sources.shift();

    if ((_target&&_target.constructor==Object) && (_source&&_source.constructor==Object)) {
      for (const _key in _source) {
        var o=_source[_key]
        if (o&&o.constructor==Object) {
          if(!_target[_key]||_target[_key].constructor!=Object){
            _target[_key]={}
          }
          _Util._mergeDeep(_target[_key], _source[_key]);
        } else if(!_target[_key]||_target[_key].constructor!=Function){
          _target[_key]=_source[_key];
        }
      }
    }

    return _Util._mergeDeep(_target, ..._sources);
  },
  _mergeDeepWithArray:function(_target, ..._sources) {
    if (!_sources.length) return _target;
    const _source = _sources.shift();

    if ((_target&&_target.constructor==Object) && (_source&&_source.constructor==Object)) {
      for (const _key in _source) {
        var o=_source[_key]
        if(o&&o.constructor==Array&&_target[_key]&&_target[_key].constructor==Array){
          _target[_key].push(...o)
        }else if (o&&o.constructor==Object) {
          if(!_target[_key]||_target[_key].constructor!=Object){
            _target[_key]={}
          }
          _Util._mergeDeepWithArray(_target[_key], _source[_key]);
        } else if(!_target[_key]||_target[_key].constructor!=Function){
          _target[_key]=_source[_key];
        }
      }
    }

    return _Util._mergeDeepWithArray(_target, ..._sources);
  },
  _clearAttributes:function(o){
    for(var k in o){
      if(!o[k]){
        delete o[k]
      }
    }
  },
  _findInInsensitive:function(r,p,_tmpPanel){
    try{
      if(_tmpPanel&&_tmpPanel.includes("BZ.TW")){
        _tmpPanel=0
      }
      return r&&r.find(p,_tmpPanel)
    }catch(e){
      _domActionTask._reportAppInfo("Error on findInInsensitive: "+e.message)
      return r.find(_Util._updateAttrSelector(p))
    }
  },
  _getAttrPath:function(n,v){
    return ":attr("+n+"="+_Util._trimSpace(v.replace(/[\(\)\{\}\[\]]/g," "))+")"
  },
  _updateAttrSelector:function(v){
    return v.replace?v.replace(/(\[)([^=]+)(\=)([\"\']*)([^\]\"\']+)([\"\']*)( *)(i*)(\])/g,":attr($2$3$5)"):v
  },
  _getElementByXY:function(b,x,y,_ignoreElement){
    var _last;
    for(var i=0;i<b.children.length;i++){
      var o=b.children[i];
      var r=o.getBoundingClientRect();
      if(r.x<=x && r.x+r.width>=x && r.y<=y && r.y+r.height>=y){
        if(o!=_ignoreElement){
          _last=o;
        }
      }
      _last=this._getElementByXY(o,x,y,_ignoreElement)||_last;
    }
    return _last;
  },
  _isBetweenWords:function(w,i){
    if(w){
      if(i){
        w=w[0]
      }else{
        w=w[w.length-1]
      }
      return !w.match(/[a-z0-9]/i)
    }
    return 1
  },
  _splitWords:function(w,s){
    w=w.trim()
    s=s||"\n;,"
    for(var i=0;i<s.length;i++){
      if(w.includes(s[i])){
        s= w.split(s[i]);
        w=[]
        for(var i=0;i<s.length;i++){
          var ss=s[i].trim()
          if(ss){
            w.push(s)
          }
        }
        return w
      }
    }
    return [w]
  },
  _isDynamicValue:function(v){
    v=v.match(/[0-9]+/g);
    return !(!v || (v.length==1 && parseInt(v[0])<3))
  },
  _setBlankIFramePath:function(p,e){
    if(e.ownerDocument!=document){
      for(var i=0;i<window.frames.length;i++){
        if(window.frames[i]==e.ownerDocument.defaultView){
          p[0]="$(BZ.TW.document.body).find('IFRAME:eq("+i+")')[0].contentDocument"
        }
      }
    }
  },
  _findDomsWithSimplySolution:function(ps){
    let o=document.body,os,_lastX;
    try{
      ps.find(x=>{
        x=x||0
        if(x!="BZ.TW.document"){
          if(os&&os.toArray()){
            os=os.toArray()
            _Util._spliceAll(os,x=>_Util._isHidden(x))
            os=$(os)
          }
          if(os===undefined){
            if(x.match(/^body\>/i)){
              o=document
            }
            let xs=_matchTRTD(x,$(BZ.TW.document.body))
            if(xs){
              os=xs
              _lastX=x
              return
            }
            os=$(o).find(x)
          }else if(x&&!$.isNumeric(x)){
            let xos=[],_idx
            
            let xs=_matchTRTD(x,os)
            if(xs){
              os=xs
              _lastX=x
              return
            }
            if(x.match(/\:(eq\([0-9]+\)|last|first)$/)){
              x=x.split(":")
              _idx=x.pop()
              x=x.join(":")
            }
            if(_lastX.match(/contains/i)){
              os=os.toArray()
              let rs=[]
              while(os.length){
                let oo=os.pop();
                rs.push(oo)
                let xo=$(oo).find(x).toArray()
                if(xo.length){
                  xo.reverse()
                  xo.forEach(y=>{
                    xos.unshift(y)
                  })

                  _Util._spliceAll(os,xx=>$(xx).find(oo).length)
                }
              }
              while(!xos.length&&rs.length&&rs[0]&&rs[0].tagName!="BODY"){
                rs=rs.map(r=>r.parentElement)
                rs.forEach(r=>{
                  if(r){
                    let xo=$(r).find(x)
                    if(xo.length){
                      xo.reverse()
                      xo.forEach(y=>{
                        xos.unshift(y)
                      })
                    }
                  }
                })
              }
              os=$(xos)
            }else{
              os=os.find(x)
            }
            if(os.length){
              if(_idx=="first"){
                os=[os[0]]
              }else if(_idx=="last"){
                os=[os[os.length-1]]
              }else if(_idx){
                os=[os[_idx.match(/[0-9]+/)]]
              }
              if(_idx){
                os=$(os)
              }
            }
          }else if(os.length){
            if(_lastX.match(/contains/i)){
              os=os.toArray()
              let xo=[],lo
              while(os.length){
                let oo=os.pop();
                xo.unshift(oo)
                
                _Util._spliceAll(os,xx=>$(xx).find(oo).length)
              }
              os=xo
            }
            if(os[x]){
              os=[os[x]]
            }else{
              os=0
              return 1
            }
          }
          _lastX=x
        }
      })
    }catch(e){}
    return _Util._isEmpty(os)?0:os
    
    function _matchTRTD(x,os){
      if(x.match(/\>[a-zA-Z]+\:(eq\(|last|first|Contains|attr|endContains|equal)/)||x.match(/\>[a-zA-Z]+$/)||x.match(/\>[a-zA-Z]+[.#]/)){
        x=x.split(">")
        let ss=os
        x.forEach(y=>{
          ss=ss.find(y)
        })
        os=ss.toArray()
        return os
      }
      
    }
  },
  _formatFun:function(s,t){
    t=t||""
    let f="\"'`/",b,fs=[],w="",
        k={
          "(":")",
          "[":"]",
          "{":"}"
        },ks=[],_newLine;
    for(let i=0;i<s.length;i++){
      let c=s[i]
      if(c=="\\"){
        b=1
      }else if(b){
        b=0
      }else if(c=="\r"){
        continue
      }else if((c==" "||c=="\t")&&_newLine){
        continue
      }else if(f.includes(c)){
        if(fs[0]==c){
          fs.shift()
        }else{
          fs.unshift(c)
        }
      }else if(!fs.length){
        if(k[c]){
          ks.unshift({k:c,i:i})
          if(c=="{"){
            w+=c+"\n"
            _newLine=1
            t+="  "
            w+=t
            while(s[i+1]&&s[i+1].match(/\s/)){
              i++
            }
            continue
          }
        }else if(ks[0]&&k[ks[0].k]==c){
          let ck=ks.shift()
          if(c=="}"){
            t=t.substring(2)
            if(_newLine){
              w=w.trim()
            }
            w+="\n"+t+c
            while(s[i+1]&&s[i+1].match(/\s/)){
              i++
            }
            continue
          }
        }else if(c==";"&&(!ks[0]||ks[0].k=="{")){
          w+=c+"\n"+t
          _newLine=1
          while(s[i+1]&&s[i+1].match(/\s/)){
            i++
          }
          continue
        }
      }
      w+=c
      _newLine=c=="\n"
      if(_newLine){
        w+=t
      }
    }
    return w
  },
  _isFunction:function(s){
    s=s.trim()
    return s.match(/^\(?(function|\([^\)]*\) *=> *)/)
  },
  _newFindDom:function(){
    document._Contains=document._input=document._link=document._near=document._after=document._before=document._endContains=document._rowcol=0
  },
  _findDoms:function(_paths,_errOnHidden,_bRetry,_toShow){
    _extendJQuery()
    _Util._newFindDom()
    if(_paths.constructor==String){
      _paths=_paths.split("\n")
    }
    if(bzTwComm._isExtension()){
      let p=_paths[0]
      if(p&&p.constructor==String&&p.includes("frame")){
        _paths[0]="BZ.TW.document"
      }else if(p&&p.constructor==String&&!p.includes("BZ.TW.document")){
        _paths.unshift("BZ.TW.document")
      }
    }
    _paths=_JSHandler._prepareData(_Util._clone(_paths));
    if(!_paths){
      return
    }
    let _showIdx=_toShow?-1:_paths.findIndex(x=>x&&x.match&&x.match(/:show([\:\.\[\#]|$)/))
    if(_showIdx!=-1){
      let xs=_paths.splice(_showIdx+1)
      let oo=_Util._findDoms(_paths,_errOnHidden,_bRetry,1)
      oo.forEach(y=>{
        if(_Util._isHidden(y)&&!y.getBoundingClientRect().width){
          y._bzShow=1
          $(y).show()
        }
      })
      _paths.push(...xs)
      let o=_Util._findDoms(_paths,_errOnHidden,_bRetry,1)
      
      oo.forEach(y=>{
        if(y._bzShow){
          delete y._bzShow
          $(y).css({display:""})
        }
      })
      return o
    }

    let _orgPath=_Util._clone(_paths)
    
    var os,_root,_cells,_osInHidden=[]
    if(!_paths.find(x=>{
      return !$.isNumeric(x)&&(x.includes("shadowRoot")||x.match(/^canvas:/i))
    })&&_paths.find(x=>{
      return !$.isNumeric(x)&&x.match(/\:(first|last|eq)/)
    })){
      os=_Util._findDomsWithSimplySolution(_paths)
      if(os&&os.length){
        if(os.toArray){
          os=os.toArray()
        }
        return os
      }
      os=0
    }

    // let _idx=_paths.pop()||0;
    // if(!$.isNumeric(_idx)){
      // _paths.push(_idx)
      // _idx=null
    // }

    let _idx=null;
    _paths=_paths.filter(x=>{
      if($.isNumeric(x)){
        _idx=parseInt(x)
      }else{
        return 1
      }
    })

    let _sufIdx=_paths[_paths.length-1]
    if(!$.isNumeric(_sufIdx)){
      //for :input
      if(_paths.length>2&&_sufIdx.match(/:input\(/)){
        _paths.pop()
        _paths=_Util._findDoms(_paths);
        let os=[]
        _paths.forEach(x=>{
          $util._tmpFormForSearchingInput=x
          os.push(...$(x).find(_sufIdx).toArray())
        })
        if(os.length&&_idx!==undefined){
          os=[os[_idx||0]]
        }
        return os
      }
      //for quick path
      if(_sufIdx.match(/^body\>[^\>]+\>/i)){
        return [_Util._getElementByQuickPath(_sufIdx)]
      }
      _sufIdx=_sufIdx.split(":").pop()
      
      if(!_sufIdx.match(/last|first/)){
        _sufIdx=0
      }else{
        _paths[_paths.length-1]=_paths[_paths.length-1].replace(/[:](last|first)$/,"")
      }
    }

    try{
      if (_paths && _paths.length>0 && (!window.BZ || BZ._documents || BZ._autoRecording)) {
        //for shadowRoot
        while(_paths.includes("shadowRoot")){
          if(os){
            let tmp=_paths.shift();
            if(tmp=="shadowRoot"){
              for(var i=0;i<os.length;i++){
                if(os[i].shadowRoot){
                  os=_root=$(os[i].shadowRoot)
                  break
                }
              }
            }else{
              os=_root=os.find(tmp)
            }
          }else{
            let ps=_paths.splice(0,_paths.indexOf("shadowRoot"))
            os=_Util._findDoms(ps)
            for(var i=0;i<os.length;i++){
              if(os[i].shadowRoot){
                os=_root=$(os[i].shadowRoot)
                break
              }
            }
            _paths.shift()
          }
        }
        if(!os){
          os=_paths[0];
          if(os.constructor==String){
            if(os=="BZ.TW.document"){
              os=_root=$(document);
            }else{
              os=_root=$(_Util._eval(os))
            }
            if(_paths[1]&&_paths[1].toUpperCase().startsWith("IFRAME")){
              os=_root=$(os).find(_paths[1])
              if(os.length){
                os=_root=$(os.toArray().map(x=>{
                  return x.contentWindow.document
                }))
                _paths.splice(1,1)
              }else{
                return
              }
              
            }
          }else{
            os=_root=$(os)
          }
          if (_paths.length==1 || !_paths[1].toUpperCase) {
            return [os[0]];
          }else if(_paths[1]=="defaultView"){
            return [window.BZ?BZ.TW:window];
          }
        }
        /*
        var _cell=_Util._findElementFromParent(_root,_paths,_idx)
        if(_cell){
          return [_cell]
        }
        */
        
        let _curPath=_paths[_paths.length-1]

        _cells=_Util._findInInsensitive(_root,_curPath,_paths[_paths.length-2]);

        if(_curPath.includes(":before")){
          _cells=_cells.toArray?_cells.toArray():_cells
          _cells.reverse()
        }
        _cells=_Util._findChildrenDomFromList(_cells)
        for(var i=0;i<_cells.length;i++){
          var o=_cells[i];
          if(_Util._isHidden(o)){
            _osInHidden.push(o)
            _cells.splice(i--,1)
          }
        }
        if(!_errOnHidden){
          _cells.push(..._osInHidden)
        }
        if(!_cells.length){
          return []
        }
        if(_paths.length>2){
          for(var i=1;i<_paths.length-1;i++){
            os=os.find(_Util._findInInsensitive(_root,_paths[i],_paths[i-1]));
            os=_getOffset(_paths[i],os)
          }
          if(!os.length){
            os=_root;
            for(var i=1;i<_paths.length-1;i++){
              os=os.find(_Util._findInInsensitive(_root,_paths[i].replace(/\:endContains\(/g,":Contains("),_paths[i-1]));
            }
          }
          if(!os.length){
            return []
          }else if(_cells.length==1&&$(os).find(_cells).length){
            return _getOffset(_curPath,_cells)
          }
          if(os.length>1&&_paths.find(x=>x&&x.match&&x.match(/\:(contains|endcontains|equal|endequal)\(/i))){
          // if(os.length>1&&$.isNumeric(_idx)){
            var nos=_Util._findChildrenDomFromList(os,_cells)
            if(!nos.length){
              return []
            }
            var oo=$(_root).find("*");
            var ii=oo.index(nos[0])
            for(var i=0;i<_cells.length;i++){
              if(oo.index(_cells[i])<ii && _cells.length){
                _cells.splice(i--,1)
              }
            }
            _cells.sort(function(a,b){
              var ba=Boolean(nos.find(a)[0]);
              var bb=Boolean(nos.find(b)[0]);
              if(ba==bb){
                return oo.index(a)-oo.index(b)
              }
              return ba?-1:1
            })
          }else{
            _cells=os.find(_cells)
          }
        }
        
        if(_cells){
          if(_cells.constructor!=Array){
            _cells=_cells.toArray()
          }
        }
        
        if(_cells&&_cells[0]&&_cells[0].tagName=="CANVAS"&&_orgPath.join(" ").includes(":textElement")){
          let _txt=_descAnalysis._retrieveTextForElementPathItem(_orgPath)
          if(_idx===null){
            let n=0
            _cells.forEach((c,i)=>{
              c.bzTxtElement=c.bzTxtElement||_TWHandler._getCanvasTextElement(c,_txt,0)
            })
            return _getOffset(_curPath,_cells)
          }else{
            let i=0;
            let cc=_cells.find(c=>{
              let cs=_TWHandler._getCanvasTextElement(c,_txt)
              if(cs.length+i>_idx){
                c.bzTxtElement=cs[_idx-i]
                return 1
              }else{
                i+=cs.length
              }
            })
            if(!cc){
              cc=_cells[_cells.length-1]
              let cs=_TWHandler._getCanvasTextElement(cc,_txt)
              cc.bzTxtElement=cs[cs.length-1]
            }
            return _getOffset(_curPath,[cc])
          }
        }else{
          if(_sufIdx=="first"){
            return _getOffset(_curPath,[_cells[0]])
          }else if(_sufIdx=="last"){
            return _getOffset(_curPath,[_cells.pop()])
          }else if(_idx===null){
            return _getOffset(_curPath,_cells)
          }else{
            return _getOffset(_curPath,[_cells[_idx]||_cells[_cells.length-1]])
          }
        }
      }
    }catch(e){
      _domActionTask._reportAppInfo("Error on findDoms: "+e.message)
      console.log(e.stack)
      if(os && os.constructor==String && !_bRetry){
        BZ._prepareDocument();
        return this._findDoms(_paths,_errOnHidden,1);
      }
    }
    return null;
    
    function _getOffset(v,os){
      let _toArray
      if(os&&os.toArray){
        _toArray=1
        os=os.toArray()
      }
      v=v.match(/(\[[^\]]+\])|(\:[^\(\.\#\[]+(\([^\)]*\)+([^:\.\#]+\))*)?)|([\.\#][^\:\[\.\#]+)/g)
      if(!v||!os){
        if(_toArray){
          os=$(os)
        }
        return os
      }
      os=os.filter(x=>x).map(o=>{
        v.forEach(x=>{
          if(o){
            if(x==":next"){
              o=o.nextElementSibling
            }else if(x==":previous"){
              o=o.previousElementSibling
            }else if(x==":parent"){
              o=o.parentElement
            }
          }
        })
        return o
      })
      if(_toArray){
        os=$(os)
      }
      return os
    }
  },
  _findDomWithPanels:function(d,ps,pp){
    var _idx=d.pop()
    if(!$.isNumeric(_idx)){
      d.push(_idx)
      _idx=0
    }
    var ds=_Util._findDoms(d,pp)
    if(!ds||!ds.length){
      return
    }else if(ds.length==1){
      return ds[0]
    }
    for(var i=ps.length-1;i>=0;i--){
      var p=ps[i]
      if(!p){
        continue
      }
      var pps=_Util._findDoms(p)
      var dds=$(pps).find(ds)
      if(!dds||!dds.length){
      }else if(dds.length==1){
        return dds[0]
      }else{
        ds=dds
      }
    }
    if(ds){
      return ds[_idx]||ds[0]
    }
  },
  _findAfterDoms:function(o){
    var os=[o];
    while(o.parentElement&&o.tagName!="BODY"){
      $(o).nextAll().each(function(i,oo){
        os.push(oo)
      })
      o=o.parentElement
    }
    return $(os)
  },
  _findChildrenDomFromList:function(os,_cells){
    var ns=[],_last;
    for(var i=os.length-1;i>=0;i--){
      if(_cells && !$(os[i]).find(_cells).length){
        continue
      }else if(!ns.length||!$(os[i]).find(ns).length){
        ns.unshift(os[i])
      }
    }
    return $(ns)
  },
  _findTextElement:function(e){
    while(e && !$(e).text().trim() && e.tagName!="BODY"){
      e=e.parentElement
    }
    return e
  },
  _getClosestElement:function(p,o,c){
    if($(p).is(c)){
      return p
    }
    let e=$(p).find(c).toArray()
    if(e.length){
      let os=$(p).find("*")
      let oi=os.index(o),mi=0,mo;
      for(let i=0;i<e.length;i++){
        let ee=e[i]
        let x=Math.abs(oi-os.index(ee))
        if(x<mi||!mi){
          mi=x
          mo=ee
        }
      }
      return mo;
    }else if(p&&p.tagName!="BODY"){
      return _Util._getClosestElement(p.parentElement,o,c)
    }
  },
  // _findNearTxt:function(a,_compareWord){
    // let ar=a.getBoundingClientRect(),_org=a,_hide
    // _compareWord=(_compareWord||"").toLowerCase()
    // var _right=["radio","checkbox"].includes(a.type),_stop=0,_bkLabel="";
    
    // var match=0,_txt="";
    // while(a.tagName!="BODY" && a.parentNode&&!_stop){
      // var p=a.parentNode,
          // _start=!_right;
      // let w=(p.innerText||"").trim()
      // if(w){
        // for(let i=0;i<p.childNodes.length;i++){
          // let o=p.childNodes[i]
          // if(o==a){
            // _start=!_start
            // continue
          // }
          // if(_start){
            // if(o.nodeType==1){
              // _txt+=" "+_formatTxt($util.getElementText(o))
            // }else if(o.nodeType==3){
              // _txt+=" "+_formatTxt(o.textContent)
            // }
            // _txt=_txt.trim()
            // if(_txt==_compareWord||_txt.match(new RegExp(_compareWord))){
              // _txt=_compareWord
            // }
          // }else if(!_txt&&o.nodeType==1){
            // w=_formatTxt($util.getElementText(o))||""
            // if(w==_compareWord||w.match(new RegExp(_compareWord))&&_Util._positionAfterElement(a,o)){
              // _txt=w
              // break
            // }else if(w){
              // break
            // }
          // }else if(o.nodeType==3&&(o.textContent+"").trim()){
            // break
          // }
        // }
        // if(_txt){
          // break
        // }
      // }
      
      // a=p;
    // }
    
    // return _txt
    
    // function _formatTxt(w){
      // return _Util._trimSpace(_Util._filterTxt(w.toLowerCase()))
    // }
  // },
  _findNearTxt:function(a,_compareWord){
    let ar=a.getBoundingClientRect(),_org=a
    _compareWord=(_compareWord||"").toLowerCase()
    var _right=["radio","checkbox"].includes(a.type),_stop=0,_bkLabel="";

    var _start=!_right,_match=0,_txt;
    while(a.tagName!="BODY" && a.parentNode&&!_stop){
      var p=a.parentNode;
      let os=$(p).find(_org.tagName)
      if(!_bkLabel){
        let w=$util.getElementText(p)
        if(w){
          w=_Util._filterTxt(w.toLowerCase());
          w=_Util._trimSpace(w)
          if((w==_compareWord||w.match(new RegExp(_compareWord)))&&os.length==1){
            _txt=w
            break
          }
        }else{
          a=p
          continue
        }
      }
      let _first=os[0]
      if(_bkLabel&&_first!=_org&&!_Util._isHidden(_first)){
        _txt=_bkLabel
        break 
      }
      for(var i=0;i<p.childNodes.length;i++){
        var n=p.childNodes[i];
        if(n.nodeType==1&&_Util._isHidden(n)){
          continue
        }
        if(n==a){
          if(_start){
            break
          }else{
            _start=1
          }
        }else if(!_start){
          continue
        // }else if(n.nodeType==1&& _cssHandler._isInput(n)){
          // break
        }else if((n.nodeType==1||n.nodeType==3)){
//          _stop=1
          
          var v1=_Util._filterTxt($util.getElementText(n).toLowerCase()).trim();
          if(v1&&v1!=_bkLabel){
            _stop=_txt=v1
            if(!_right&&v1.length>50){
              _stop=0
            }
          }
          if(_right && _txt){
            break
          }
        }
      }

      if(!_bkLabel&&_compareWord&&_stop&&_txt&&_txt!=_compareWord&&!v1.includes(_compareWord)&&["INPUT","TEXTAREA"].includes(_org.tagName)&&!["radio","checkbox","submit","butt","image","reset"].includes(_org.type)){
        let nr=p.getBoundingClientRect()
        
        if(ar.top-nr.top<15&&ar.left-nr.left<20){
          _bkLabel=_txt
          _stop=_txt=""
          continue
        }
      }

      
      a=p;
    }

    return (_txt||"").replace(/\*+$/,"").replace(/\s+/g," ").trim()
  },
  _toTrimSign:function(v,n){
    v=(v||"").replace(_Util._trimSign,"")
    if(n){
      v=_Util._retrieveTopWords(v,n)
    }
    return (v||"").replace(_Util._trimSign,"")
  },
  //
  _match:function(d,r){
    if(d!=r){
      if(_Util._isRegexData(r)){
        let _std=r.match(/\{data\:(.+)\}/)
        try{
          if(_std){
            return _Util._eval("d"+_std)
          }else if(r){
            return _Util._eval("d.match("+r+")")
          }
        }catch(e){}
      }
    }else{
      return 1
    }
  },
  /*
  d:data, pick attribute name from data
  {
    Name:$project.data,
    Age:15,
    data:{
      value:"abc"
    }
  }
  ==>
  ["Name","Age","data"]
  */
  _pickAttrFromStringJSON:function(d){
    if(d){
      if(d.constructor==String){
        let vs=[]
        d=d.trim()
        if(d[0]=="{"&&d[d.length-1]=="}"){
          d=d.substring(1,d.length-1).trim()
          let p=d.match(/$args\: *\[[^.]+\]/)
          if(p){
            d=d.replace(p[0],"")
          }
          while(d.includes("{")&&d.indexOf("{")<d.indexOf("}")){
            d=d.replace(/\{[^\{\}]*\}/g,"''")
          }
          while(d.includes("[")&&d.indexOf("[")<d.indexOf("]")){
            d=d.replace(/\[[^\[\]]*\]/g,"''")
          }
          d=d.replace(/\:[^,]*(,|$)/g,":''$1")
          d=d.replace(/:''/g,"")
          d=d.replace(/\s/g,"")
          d=d.split(",")
          
          _Util._spliceAll(d,v=>{return !v})

          vs=d
        }
        return vs
      }else{
        return Object.keys(d)
      }
    }
  },
  _retrieveTopWords:function(w,_size){
    if(w && w.length>_size){
      w=w.split(" ");
      var ww=w[0],i=1
      while(ww.length<_size){
        ww+=" "+w[i++]
      }
      w=ww
    }
    return w
  },
  _getElementRoot:function(e){
    let r=0;
    while(e.parentNode){
      e=e.parentNode;
      if(e.constructor==ShadowRoot){
        return e
      }else if(e.tagName=="BODY"){
        r=e
      }
    }
    return r||e
  },
  _hasDeepContent:function(e){
    var _hasNone=0
    for(var i=0;i<e.children.length;i++){
      var o=e.children[i];
      if($(o).css("pointer-events")=="none"){
        _hasNone=1
      }else if(!["STYLE","SCRIPT","OPTION"].includes(o.tagName)){
        return 1
      }
    }
    return 0
  },
  _getStringBySize:function(v,i,_back){
    i=i||30
    if(v&&v.length>i){
      if(_back==1){
        return "... "+ v.substring(v.length-i)
      }else if(_back){
        i=parseInt(i/2)
        return v.substring(0,i)+"... "+ v.substring(v.length-i)
      }

      return v.substring(0,i)+" ..."
    }
    return v
  },
  getEONumList:function(n){
    let ls=[];
    for(let i=0;i<n;i++){
      ls.push(i)
    }
    let ns=[],w=0;
    while(ls.length){
      if(ls.length==1){
        ns.push(ls.pop())
      }else{
        let i=Math.ceil(ls.length/2)
        if(!w){
          ns.push(ls.splice(i,1).pop())
        }else if(w==1){
          ns.push(ls.splice(Math.ceil(parseInt(ls.length/2)/2),1).pop())
        }else if(w==2){
          ns.push(ls.splice(parseInt((ls.length+Math.ceil(ls.length/2))/2),1).pop())
        }
        w++
        if(w==3){
          w=0
        }
      }
    }
    return ns
  },  
  _compressBase64:function(bs){
    var q=9,_best;
    bs=bs.substring(22);
    
    while(1){
      var h="",hh="",k=0,j=0;
      s=bs
      while(s){
        var v=s.substring(0,q)
        var sss=s.substring(q)
        var ss=_Util._replaceAll(sss,v,"*"+j)
        if(sss!=ss){
          k+=(sss.length-ss.length)
          h+=v
          s=ss
          j++
        }else{
          hh+=s[0]
          s=s.substring(1)
        }
      }
      q++;
      if(!_best || _best>k){
        _best=k
        _bestQ=q
      }else{
        return _bestQ+"\n"+h+"\n"+hh
      }
    }
  },
  _isOverlapping:function(a,b){
    let ar=a.getBoundingClientRect()
    let br=b.getBoundingClientRect()
    if(ar.left<=br.left+10 && ar.right>=br.right-10 && ar.top<=br.top+10&&ar.bottom>=br.bottom-10){
      return 1
    }
    return br.left<=ar.left+10 && br.right>=ar.right-10 && br.top<=ar.top+10&&br.bottom>=ar.bottom-10
  },
  _unCompressBase64:function(s){
    
  },
  _removeNoJSONData:function(a){
    if(a&&![Number,String,Object,Array].includes(a.constructor)){
      return 
    }
    if(a&&[Array,Object].includes(a.constructor)){
      for(var k in a){
        if(!_Util._removeNoJSONData(a[k])){
          delete a[k]
        }
      }
    }
    return 1
  },
  _removeStringSign:function(v){
    return v?v.replace(/(^["'`])|(["'`]$)/,""):v
  },
  _refDataToJSON:function(vs,p){
    p=p||""
    let w=""
    vs.forEach(x=>{
      if(w){
        w+=",\n"
      }
      if(x._key){
        if(x._value.constructor==Array){
          w+=p+"  \""+x._key+"\" : "+_Util._refDataToJSON(x._value,p+"  ")
        }else{
          w+=p+"  \""+x._key+"\" : "+x._value
        }
      }else{
        if(x._value.constructor==Array){
          w+=p+_Util._refDataToJSON(x._value,p+"  ")
        }else{
          w+=p+"  "+x._value
        }
      }
    })
    if(vs[0]){
      if(vs[0]._key){
        w=p+"{\n"+w+"\n"+p+"}"
      }else{
        w=p+"[\n"+w+"\n"+p+"]"
      }
    }else{
      return "{}"
    }
    return w
  },
  _isJsonKey:function(s){
    return s&&(s.match(/^[0-9]*[.]?[0-9]*$/))||(!s.match(/^[0-9]/)&&s.match(/(^"[^"]*"$)|(^`[^`]*`$)|(^`[^`]*`$)|[\wÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC]+/))
  },
  _isJsonValueString:function(v){
    if(v&&v.constructor!=String){
      return
    }
    v=(v||"").trim()
    if(!v){
      return
    }else if(v.match(/(^".+"$)|(^'.+'$)|(^`.+`$)/)){
      let k=v[0]
      v=v.substring(1,v.length-1).replace(/[\\][\\]/g,"").replace(/[\\]['"`]/g,"")
      
      return !v.includes(k)
    }else if(v.match(/(^\{.+\}$)|(^\[.+\]$)/s)){
      return 1
    }else if(v.match(/(^\(.+\)$)/)){
      return _Util._isJsonValueString(v.substring(1,v.length-1))
    }else if(v.match(/(^["].*["]$)|(^['].*[']$)|(^[`].*[`]$)/)||$.isNumeric(v)){
    //}else if(v.match(/[^\?]+\:/)){
    }else{
      return
    }
    return 1
  },
  _parseJSONWithRefDataToObj:function(v,_throwError){
    v=v||""
    if(v.constructor!=String){
      v=JSON.stringify(v,0,2)
    }
    v=v.trim()
    if(!v){
      return [];
    }
    
    if(v.replace(/\s/g,"")=="{}"){
      return []
    }
    let vs=[],
        _left=_eval.bd,
        _right=_eval.db,
        _key,_value,lc=[],rc=[],s="",b,_startIdx
    
    for(let i=0;i<v.length;i++){
      let c=v[i]
      if(c=="\\"){
        b=!b
      }else if(b){
        b=0
      }else if(c.match(/\s/)&&!s){
        continue
      }else if(c==':'&&lc[0]=="{"){
        let ss=s.trim()
        if(ss&&!_key){
          if(_Util._isJsonKey(ss)){
            _key=ss
            s=""
            continue
          }else{
            return _throw(v,i)
          }
        }else if(!ss){
          return _throw(v,i)
        }else if(!ss.includes("?")&&lc.length==1){
          return _throw(v,i)
        }
      }else if((c==","||c==_left[lc[0]])&&lc.length==1){
        s=s.trim()||""
        if(!_Util._isJsonValueString(s)&&!_Util._hasCode(s)&&!$.isNumeric(s)&&!s.match(/^(true|false)$/)){
          return _throw(v,i)
        }
        if(_key){
          vs.push({
            _key:_key,
            _value:s
          })
        }else if(lc[0]=="["){
          vs.push({_value:s})
        }else{
          return _throw(v,i)
        }
        _key=_value=s=""
        if(c!=","){
          lc.pop()
        }
        continue
      }else if(!lc[0]&&(c=="{"||c=="[")&&!vs.length){ //start
        lc.unshift(c)
        continue
      }else if(!lc[0]){ //not start { and [
        return _throw(v,i)
      }else if(c==_left[lc[0]]){
        lc.shift()
      // }else if(lc[0]=="{"&&!_key&&!s&&!c.match(/["'a-zA-ZÀ-Üà-øoù-ÿŒœ\u4E00-\u9FCC\$\_]/)){
        // return _throw(v,i)
      }else if(_left[c]){
        lc.unshift(c)
      }
      s+=c
    }
    if(s){
      return _throw(v,v.length-s.length)
    }
    if(vs.find(x=>{
      if(x._key&&"'\"`".includes(x._key[0])){
        x._key=x._key.substring(1,x._key.length-1)
      }
      if(x._value.match(/^[\{\[]/)){
        try{
          x._value=_Util._parseJSONWithRefDataToObj(x._value,1)
        }catch(ex){
          v=ex.message
          return 1
        }
      }
    })){
      return _throw(v,0)
    }
    return vs
    function _throw(v,i){
      if(i){
        i-=25
        if(i<0){
          i=0
        }
      }
      let _msg=_bzMessage._system._error._parseParameterError+": "+v.substring(i,i+50)
      if(_throwError){
        throw new Error(_msg)
      }
      alert(_msg)
    }
  },
  _showLabelMenu:function(k,e,x,y,t,w){
    let o=$("#"+k)[0]
    if(!o){
      o=$(`<div id='${k}' class='bz-menu-with-arrow-${w}'><div class='bz-menu-with-arrow-out-${w}'></div><div class='bz-menu-with-arrow-in-${w}'></div><pre class='bz-menu-with-arrow-box'></pre></div>`)[0]
    }
    if(o._curData&&o._curData.x==x&&o._curData.y==y&&o._curData.t==t){
      return
    }
    o._curData={x:x,y:y,t:t}
    o=$(o)
    o.css({opacity:0})
    o.appendTo(document.body)
    o.find(".bz-menu-with-arrow-box").text(t)
    let r=o[0].getBoundingClientRect()
    o.find(".bz-menu-with-arrow-out-"+w).css({top:r.height-5+"px",left:r.width/2-2+"px"})
    o.find(".bz-menu-with-arrow-in-"+w).css({top:r.height-6+"px",left:r.width/2-2+"px"})
    o.css({opacity:1,left:x-r.width/2+"px",top:y-r.height-7+"px"})
    return o[0]
  },
  _isCompleteBlock:function(w){
    w=w.replace(/\\\\/g,"").replace(/(\\\"|\\\'|\\\(|\\\)|\\\[|\\\]|\\\{|\\\})/g,"").replace(/(\"[^\"]*\"|\'[^\']*\')/g,"")
    let ks=_eval._leftKeys;
    return !w.match(/[\"\']/)&&!['[','{','('].find(x=>{
      m1=w.match(new RegExp("[\\"+x+"]","g"))||[]
      m2=w.match(new RegExp("[\\"+ks[x]+"]","g"))||[]
      return m1.length!=m2.length
    })
  },
  _getRegexByBZName:function(r,_final){
    while(r&&r[0]=="/"&&r[r.length-1]=="/"){
      r=r.substring(1,r.length-1)
    }
    if(r&&r.startsWith("BZ-")){
      var rr=r.toUpperCase()
      for(var i=0;i<_IDE._data._curVersion.setting.attributeMap.length;i++){
        var v=_IDE._data._curVersion.setting.attributeMap[i]
        if(rr=="BZ-"+v.key.toUpperCase()){
          r=v.regex
          r=r.substring(1,r.length-1)
          break
        }
      }
    }
    if(_final&&_IDE._data._curModule){
      r=r.replace("{module}",_IDE._data._curModule._data.name).replace("{num}","[0-9]+").replace("{timestamp}","[0-9]{13}").replace("{time}","[0-9]{6}")
    }
    return r
  },
  _parseExpression:function(s,_headerSplit,_logic){
    let w="",b,p=[],g,gs=[],hs=[],pml={
      "'":"'",
      '"':'"',
      "{":"}",
      "(":")",
      "[":"]",
      "/":"/",
      "`":"`"
    },pmr=_Util._swapKeyValue(pml),_split=""
    
    for(let i=0;i<s.length;i++){
      let c=s[i]
      if(b){
        w+=c
        b=0
      }else if(c=="\\"){
        b=1
      }else if(p.length){
        w+=c
        if(pml[p[p.length-1]]==c){
          p.pop()
        }else if(pml[c]){
          p.push(c)
        }
      }else if(_headerSplit&&c.match(_headerSplit)){
        if(gs.length||w){
          hs=hs.concat(gs)
          w=w.trim()
          if(w){
            hs.push(w)
            w=""
          }
          gs=[]
          if(_split){
            continue
          }
        }
        _split+=c.match(_headerSplit)[0]
        _split=_split.replace("==","=")
      }else if(pml[c]){
        p.push(c)
        w+=c
      }else if(_logic&&(c=="|"||c=="&")){
        if(w){
          gs.push(w)
        }
        gs.push(c)
        w=""
      }else if(!c.match(/\s/)||w){
        w+=c
      } 
    }
    if(w){
      gs.push(w)
    }
    gs=gs.map(x=>{
      while(x.match(/^[\(](.+)[\)]$/)){
        x=x.substring(1,x.length-1)
      }
      return x
    })
    if(_headerSplit){
      if(hs.length){
        return {_headers:hs,_groups:gs,_split:_split}
      }else{
        return {_headers:gs,_groups:[],_split:_split}
      }
    }else{
      return gs
    }
  }
};window._TWHandler={
  _resetTime:60000,
  _lastPageInfo:{},
  _curRequestList:[],
  BZ_sent:0,
  _popExpected:{alert:[],confirm:[],prompt:[],onbeforeunload:[]},
  _popActual:{alert:[],confirm:[],prompt:[],onbeforeunload:[]},
  _init:function(){
    this.BZ_sent=0;
    this._lastPageInfo={};
    this._popExpected={alert:[],confirm:[],prompt:[],onbeforeunload:[]};
    this._popActual={alert:[],confirm:[],prompt:[],onbeforeunload:[]};
  },
  startInit:function(){
    console.log("call startInit ...."+window.extensionContent)
    $(document.body).on("mouseover","a",function(){
      _Util._removeLinkTarget(this)
    })
    _TWHandler._takeoverOpenWin();
  },
  _uiSync:function(){
    
  },
  _chkPopInfo:function(_action,_second){ //for alert, confirm, prompt
    var a=_TWHandler._popActual;
    var e=_TWHandler._popExpected;

    for(var k in a){
      var aa=a[k].shift();
      var ee=e[k].shift();
      if (aa===undefined && (ee===undefined || ee.expection===undefined)) {
      }else if (aa===undefined) {
        if(!_second){
          e[k].unshift(ee);
          return "wait"
        }
        return _Util._formatMessage(_bzMessage._test._error._missPop,[k,ee.expection]);
      }else if (ee===undefined) {
        return _Util._formatMessage(_bzMessage._test._error._unexpectedPop,[k,aa]);
      }else if (aa.trim()!=ee.expection.toString().trim()) {
        return _Util._formatMessage(_bzMessage._test._error._unMatchPop,[k,ee.expection,aa]);
      }
    }
  },
  _setPlayMode:function(v){
    _TWHandler._curMode=v

    if(bzTwComm._isExtension()){
      bzTwComm._postToApp({c:"_TWHandler._curMode='"+v+"'"})
    }
  },
  _setBackTestPage:function(w){
    w=w||window
    this._init()
    if(w.BZ_Alert){
      w.alert=w.BZ_Alert;
      w.confirm=w.BZ_Confirm;
      w.prompt=w.BZ_Prompt;
      if(w.onbeforeunload){
        w.onbeforeunload=w.BZ_Onbeforeunload;
      }else if(_TWHandler._checkJQueryEvent().beforeunload){
        _TWHandler._checkJQueryEvent().beforeunload[0].handler=w.BZ_Onbeforeunload;
      }
      
      w.BZ_Alert=0;
      w.BZ_Confirm=0;
      w.BZ_Prompt=0;
      w.BZ_Onbeforeunload=0;
      delete w.BZ_Onbeforeunload_fun;
    }

    //take off outer link
    w.document._handledForOutDomain=false;
    if(window.BZ){
      $(w.document).off("click","a");
    }
 },
  _takeoverFileInput:function(w){
    w=w.HTMLInputElement?w.HTMLInputElement.prototype:0;
    
    if(w && !w._addEventListener){
      w._addEventListener=w.addEventListener;
      w.addEventListener=function(a,b,c){
        if(a=="change" && this.tagName=="INPUT" && this.type=="file"){
          _TWHandler._lastUploadFileFun=b;
        }
        this._addEventListener(a,b,c)
      }
    }
  },
  _takeoverWin:function(keepPopMsg,_data){
    if(bzTwComm._isExtension()){
      if(_data.event && _data.event.popType){
        $("#bzPopReturnData").remove();
        var v=document.createElement("div");
        v.id="bzPopReturnData";
        document.body.parentNode.appendChild(v);
        if(_data.event.alerts){
          $(v).text(JSON.stringify(_data.event.alerts))
        }else{
          $(v).text(_data.event.returnValue)
        }
      }
      return bzTwComm._postToApp({_fun:"_takeoverWin",_scope:"_TWHandler"})
    }else if(bzTwComm._isIDE()){
      return;
    }else{
      console.log("do _takeoverWin in app")
    }
    try{
      if(window.BZ){
        if(BZ._documents){
          BZ._documents.each(function(i,d){
            if(d){
              _doIt(d.defaultView)
            }
          });
        }
      }else{
        _doIt(window);
        var os=document.getElementsByTagName("IFRAME");
        for(var i=0;i<os.length;i++){
          v=os[i]
          if(!v.src||!v.src.startsWith("http")){
            if(v.contentDocument){
              _doIt(v.contentDocument.defaultView);
            }
          }
        }
      }
    }catch(e){
      console.log(e.stack)
    }
    function _doIt(w){
      if(!w||document.getElementById("bzOverrideMark")){
        return;
      }
      if(!keepPopMsg&&_TWHandler._curMode!="record"){
        _TWHandler._takeoverPopMsg(w);
      }

      _TWHandler._takeoverConsole(w);
      _TWHandler._takeoverFileInput(w);
      _TWHandler._setUnload();
      _TWHandler._takeoverOpenWin(w);
      _TWHandler._takeoverCanvas(w)
      _TWHandler._takeoverSocket(w);
      var a=document.createElement("div");
      a.id="bzOverrideMark";
      a.style.display="none";
      w.document.body.parentNode.appendChild(a)
    }
  },
  _takeoverConsole:function(w){
    if(!w._orgAssert){
      w._orgAssert=w.console.assert;
      var _this=this;
      w.console.assert=function(a,b){
        if(!a){
          _this._assertList=_this._assertList||[];
          _this._assertList.push(b)
        }
      }
    }
  },
  _takeoverCanvas:function(w){
    w=w||window
    if(window.name.includes("bz-client")){
      return
    }
    let _CanvasRenderingContext2D="Ca"+"nvas"+"Render"+"ingCont"+"ext2D",
        _prototype="pro"+"tot"+"ype",
        _fillText="fi"+"llTe"+"xt",
        _strokeText="st"+"rokeT"+"ext",
        _clearRect="cle"+"arR"+"ect",
        _reset="r"+"es"+"et",
        _setTransform="se"+"tTr"+"ansfo"+"rm",
        _transform="tr"+"ansfo"+"rm",
        _scale="sca"+"le",
        _translate="tra"+"nsla"+"te",
        _getTransform="ge"+"tTra"+"nsfo"+"rm",
        _drawImage="dra"+"wIma"+"ge",
        _putImageData="pu"+"tIma"+"geD"+"ata",
        _createImageData="cr"+"eateI"+"mageD"+"ata",
        _HTMLCanvasElement="HT"+"MLCan"+"vasEl"+"eme"+"nt",
        _width="wi"+"dth",
        _height="he"+"ig"+"ht",
        _setAttribute="setAttribute";
        
    if(!w[_CanvasRenderingContext2D][_prototype]._bzFillText){
      w[_HTMLCanvasElement][_prototype]._bzSetAttribute=w[_HTMLCanvasElement][_prototype][_setAttribute];
      w[_HTMLCanvasElement][_prototype][_setAttribute]=function(a,b){
        if(a=="width"||a=="height"){
          _clearMap(this["ge"+"tCon"+"tex"+"t"]("2"+"d"))
        }
        this._bzSetAttribute(a,b)
      }

      w[_CanvasRenderingContext2D][_prototype]._bzFillText=w[_CanvasRenderingContext2D][_prototype][_fillText];
      w[_CanvasRenderingContext2D][_prototype][_fillText]=function(a,b,c,d){
//        console.log("fill text: "+a+","+b)
        _handleFillText(this,a,b,c,d)
        this._bzFillText(a,b,c,d)
      }

      w[_CanvasRenderingContext2D][_prototype]._bzStrokeText=w[_CanvasRenderingContext2D][_prototype][_strokeText];
      w[_CanvasRenderingContext2D][_prototype][_strokeText]=function(a,b,c,d){
        _handleFillText(this,a,b,c,d)
        this._bzStrokeText(a,b,c,d)
      }


      w[_CanvasRenderingContext2D][_prototype]._bzClearRect=w[_CanvasRenderingContext2D][_prototype][_clearRect]
      w[_CanvasRenderingContext2D][_prototype][_clearRect]=function(a,b,c,d){
        // console.log("_clearMap:"+a+":"+b+":"+c+":"+d)
        _clearMap(this,a,b,c,d)
        this._bzClearRect(a,b,c,d)
      }

      w[_CanvasRenderingContext2D][_prototype]._bzReset=w[_CanvasRenderingContext2D][_prototype][_reset]
      w[_CanvasRenderingContext2D][_prototype][_reset]=function(a,b,c,d){
        // console.log("_clearMap:"+a+":"+b+":"+c+":"+d)
        _clearMap(this)
        this._bzReset(a,b,c,d)
      }

      if(!w[_CanvasRenderingContext2D][_prototype][_getTransform]){
        w[_CanvasRenderingContext2D][_prototype]._bzSetTransform=w[_CanvasRenderingContext2D][_prototype][_setTransform]
        w[_CanvasRenderingContext2D][_prototype][_setTransform]=function(a,b,c,d,e,f){
          _TWHandler._curTransform={
            a:a,b:b,c:c,d:d,e:e,f:f
          }
          this._bzSetTransform(a,b,c,d,e,f)
        }

        w[_CanvasRenderingContext2D][_prototype]._bzTransform=w[_CanvasRenderingContext2D][_prototype][_transform]
        w[_CanvasRenderingContext2D][_prototype][_transform]=function(a,b,c,d,e,f){
          let v=_TWHandler._curTransform=_TWHandler._curTransform||{a:1,b:0,c:0,d:1,e:0,f:0}
          v.e+=e*v.a
          v.f+=f*v.d
          v.a*=a
          v.b+=b
          v.c+=c
          v.d*=d
          // console.log("transform:"+v.a+":"+v.b+":"+v.c+":"+v.d+":"+v.e+":"+v.f)
          
          this._bzTransform(a,b,c,d,e,f)
        }

        w[_CanvasRenderingContext2D][_prototype]._bzScale=w[_CanvasRenderingContext2D][_prototype][_scale]
        w[_CanvasRenderingContext2D][_prototype][_scale]=function(a,b){
          let v=_TWHandler._curTransform=_TWHandler._curTransform||{a:1,b:0,c:0,d:1,e:0,f:0}
          v.a*=a
          v.d*=b
          // console.log("scale:"+v.a+":"+v.d)
          this._bzScale(a,b)
        }

        w[_CanvasRenderingContext2D][_prototype]._bzTranslate=w[_CanvasRenderingContext2D][_prototype][_translate]
        w[_CanvasRenderingContext2D][_prototype][_translate]=function(a,b){
          let v=_TWHandler._curTransform=_TWHandler._curTransform||{a:1,b:0,c:0,d:1,e:0,f:0}
          v.e+=a
          v.f+=b
          // console.log("translat:"+v.e+":"+v.f)
          this._bzTranslate(a,b)
        }

        w[_CanvasRenderingContext2D][_prototype]._bzGetTransform=w[_CanvasRenderingContext2D][_prototype][_getTransform]
        w[_CanvasRenderingContext2D][_prototype][_getTransform]=function(){
          if(this._bzGetTransform){
            return this._bzGetTransform()
          }else{
            return _TWHandler._curTransform||{a:1,b:0,c:0,d:1,e:0,f:0}
          }
        }
      }
      /*
      w[_CanvasRenderingContext2D][_prototype]._bzDrawImage=w[_CanvasRenderingContext2D][_prototype][_drawImage];
      w[_CanvasRenderingContext2D][_prototype][_drawImage]=function(a,b,c,d,e,f,g,h,j){
        let r=this[_getTransform]()
        if(a.src){
          let dd={
            t:a.src.split("/").pop().split(".")[0],
            w:h*r.a,
            h:j*r.d,
            x:f+r.e,
            y:g+r.f,
            _img:1
            // bg:bg
          }
          dd.c={x:dd.x+dd.w/2,y:dd.y+dd.h/2}
          _addData(this,dd)
        }
        this._bzDrawImage(a,b,c,d,e,f,g,h,j)
      }
      
      // w[_CanvasRenderingContext2D][_prototype]._bzMoveTo=w[_CanvasRenderingContext2D][_prototype].moveTo;
      // w[_CanvasRenderingContext2D][_prototype].moveTo=function(a,b){
        // // console.log("--------moveTo--------")
        // // let r=this[_getTransform]()
        // // console.log(r)
        // // console.log(a+":"+b)
        // // console.log("----------------------------")
        // this._bzMoveTo(a,b)
      // }
      
      // w[_CanvasRenderingContext2D][_prototype]._bzLineTo=w[_CanvasRenderingContext2D][_prototype].lineTo;
      // w[_CanvasRenderingContext2D][_prototype].lineTo=function(a,b){
        // // console.log("--------lineTo--------")
        // // console.log(this.canvas.getAttribute("bzTxtId"))
        // // console.log("strokeStyle: "+this.strokeStyle)
        // // console.log("lineWidth"+this.lineWidth)
        // // let r=this[_getTransform]()
        // // console.log(r)
        // // console.log(a+":"+b)
        // // console.log("----------------------------")
        // // if(a>10||b>10){
          // // return
        // // }
        // this._bzLineTo(a,b)
      // }

      w[_CanvasRenderingContext2D][_prototype]._bzCreateImageData=w[_CanvasRenderingContext2D][_prototype][_createImageData];
      w[_CanvasRenderingContext2D][_prototype][_createImageData]=function(a,b,c){
        // console.log("------CreateImageData------")
        // console.log(a+":"+b+":"+c)
        // console.log("----------------------------")
        this._bzCreateImageData(a,b,c)
      }

      w[_CanvasRenderingContext2D][_prototype]._bzPutImageData=w[_CanvasRenderingContext2D][_prototype][_putImageData];
      w[_CanvasRenderingContext2D][_prototype][_putImageData]=function(a,b,c,d,e,f){
        // console.log("-------[_putImageData]---------")
        // console.log(a+":"+b+":"+c+":"+d+":"+e+":"+f)
        // console.log("----------------------------")
        this._bzPutImageData(a,b,c,d,e,f)
      }
      /**/
    }else{
      return
    }

    function _handleFillText(cc,a,b,c,d){
      let h=parseInt(cc.font.match(/[0-9\.]+/)[0])
      // console.log(a+":"+b+":"+c+":"+h+":"+cc.measureText(a).width)
      // let bg=cc.getImageData(b, c-h, 1, 1)
      // bg=bg.data
      // bg=[bg[0],bg[1],bg[2],bg[3]]
      
      let r=cc[_getTransform](),
          ww=cc.measureText(a).width

      let dd={
        t:a,
        w:ww*r.a,
        h:h*r.d,
        x:b+r.e,
        y:c-h+r.f
        // bg:bg
      }
      
      // console.log(JSON.stringify(dd))
      // console.log(JSON.stringify(r))
      
      dd.c={x:dd.x+dd.w/2,y:dd.y+dd.h/2}
      if(cc.textAlign=="center"){
        dd.x-=dd.w/2
      }else if(cc.textAlign=="right"){
        dd.x-=dd.w
      }
      if(!cc._bzSetTransform||(dd.x>0&&dd.y>0)){
        _addData(cc,dd)
      }
    }

    function _clearMap(c,x,y,w,h){
      if(!_TWHandler._canvasDataMap){
        return
      }
      let _map=_TWHandler._canvasDataMap[c.canvas.getAttribute("bzTxtId")]
      if(_map){
        if(x===undefined){
          for(let k in _map){
            delete _map[k]
          }
        }else{
          let wx=w+x,hy=h+y
          for(var k in _map){
            let d=_map[k]
            _Util._spliceAll(d,v=>{
              return v.x>=x&&v.x<=wx&&v.y>=y&&v.y<=hy
            })
            if(!d.length){
              delete _map[k]
            }
          }
        }
        _TWHandler._buildCanvasDataPath()
      }
    }
    function _addData(c,d){
      d.t=(d.t||"").trim()
      if(!d.t){
        return
      }
      
      if(!d.t.match(_Util._allPrintableChr)){
        return 
      }

      let _key=c.canvas.getAttribute("bzTxtId")
      if(!_key||!_TWHandler._canvasDataMap[_key]){
        _key="bz"+Date.now()
        c.canvas.setAttribute("bzTxtId",_key)
        
        if(!_TWHandler._canvasDataMap){
          _TWHandler._canvasDataMap={}
        }

        _TWHandler._canvasDataMap[_key]={}
      }
      _clearMap(c,d.x,d.y,d.w,d.h)
      
      let _map=_TWHandler._canvasDataMap[_key]
      let dd=_map[d.t]
      if(!dd){
        dd=_map[d.t]=[]
      }
      
      dd.push(d)
      dd.sort((a,b)=>{
        let v=a.y-b.y
        if(!v){
          v=a.x-b.x
        }
        if(!v){
          v=a.w-b.w
        }
        if(!v){
          v=a.h-b.h
        }
        return v
      })
      _TWHandler._buildCanvasDataPath()
    }
  },
  _buildCanvasDataPath:function(){
    clearTimeout(_TWHandler._buildCanvasDataPathTimer)
    _TWHandler._buildCanvasDataPathTimer=setTimeout(()=>{
      _clean()
      _TWHandler._getCanvasData()
    },100)
    function _clean(){
      let cs=document.getElementsByTagName("CANVAS")
      for(var k in _TWHandler._canvasDataMap){
        let _found=0
        for(var i=0;i<cs.length;i++){
          if(cs[i].getAttribute("bzTxtId")==k){
            _found=1
            break
          }
        }
        if(!_found){
          delete _TWHandler._canvasDataMap[k]
        }
      }
    }
    
    // function _buildPath(){
      // let _keyList=[],_dpList=[];
      // for(var k in _TWHandler._canvasDataMap){
        // let c=_TWHandler._canvasDataMap[k]
        // for(var kk in c){
          // if(c[kk].length>1){
            // _dpList.push(c[kk])
          // }else{
            // _keyList.push(c[kk])
          // }
        // }
      // }
      // _dpList.forEach(a=>{
        
      // })
    // }
  },
  _getCloseCanvasItem:function(o,_list){
    let _min,x,y,vv;
    _list.forEach(v=>{
      if(o.x+o.w<=v.x||v.x+v.w<o.x){
        x=v.x-o.x-o.w
      }else{
        x=v.c.x-o.c.x
      }
      if(o.y+o.h<=v.y||v.y+v.h<o.y){
        y=v.y-o.y-o.h
      }else{
        y=v.c.y-o.c.y
      }
      
      vv=Math.pow(x*x+y*y,0.5)
      if(!_min||_min.v>vv){
        _min={
          o:v,
          v:vv
        }
      }
    })
    return _min
  },
  _getCanvasData:function(_map){
    if(bzTwComm._isApp()){
      bzTwComm._postToExt({_fun:"_getCanvasData",_args:[_TWHandler._canvasDataMap],_scope:"_TWHandler"})
    }else{
      return _TWHandler._canvasDataMap=_map||_TWHandler._canvasDataMap
    }
  },
  _getCanvasTextElement:function(c,t,i){
    if(_TWHandler._canvasDataMap){
      let m=_TWHandler._canvasDataMap[c.getAttribute("bzTxtId")]
      if(m){
        m=m[t]
        if(m){
          if(i!==undefined){
            return m[i]
          }
          return m
        }else if(t.match(/.+(\(.+\))+/)){
          let tt=t.split("("),ts=[]
          
          while(tt.length){
            let tv=tt.pop().replace(/\)$/,"")
            tv=_TWHandler._getCanvasTextElement(c,tv)
            if(tv){
              ts.unshift(tv)
            }else{
              return
            }
          }
          let kt=ts.shift(),_min
          while(ts.length){
            let to=ts.shift()
            kt.forEach((kk,i)=>{
              let mm=_TWHandler._getCloseCanvasItem(kk,to)
              if(!i||mm.v<_min.v){
                _min=mm
              }
            })
            if(_min){
              kt=[_min.o]
            }
          }
          if(i===undefined){
            return [_min.o]
          }else{
            return _min.o
          }
        }
      }
    }
  },
  _getCanvasTextElementIdx:function(c,d){
    if(_TWHandler._canvasDataMap){
      let m=_TWHandler._canvasDataMap[c.getAttribute("bzTxtId")]
      if(m){
        m=m[d.t]
        if(m){
          return m.findIndex(v=>{
            return v==d
          })
        }
      }
    }
  },
  _getCanvasTextElementByMousePos:function(c,x,y,_ignoreTxt){
    if(_TWHandler._canvasDataMap){
      let m=_TWHandler._canvasDataMap[c.getAttribute("bzTxtId")]
      if(m){
        let r=c.getBoundingClientRect(),_min;
        x-=r.left;
        y-=r.top;
        
        for(var k in m){
          let ds=m[k]
          for(var i=0;i<ds.length;i++){
            let d=ds[i]
            
            if(_ignoreTxt==d.t){
              continue
            }

            if(d.x<=x&&d.x+d.w>=x&&d.y<=y&&d.y+d.h>=y){
              return d
            }else{
              let v=Math.pow(Math.pow(d.c.x-x,2)+Math.pow(d.c.y-y,2),0.5)
              if(!_min||_min.v>v){
                _min={v:v,d:d}
              }
            }
          }
        }
        if(_min){
          let d=_min.d
          d.offset=0
          if(x<d.x||x>d.x+d.w||y<d.y||y>d.y+d.h){
            d.offset={
              X:parseInt(x-d.c.x),
              Y:parseInt(y-d.c.y),
              origin:"mc"
            }
          }
          return d
        }
      }
    }
  },
  _takeAssertInfo:function(){
    var v=this._assertList||[];
    this._assertList=[];
    return v;
  },
  _takeoverPopMsg:function(w){
    var _beforeunload=w.onbeforeunload || (_TWHandler._checkJQueryEvent().beforeunload?_TWHandler._checkJQueryEvent().beforeunload[0].handler:null);
    
    if((!w.BZ_Onbeforeunload && _beforeunload) || (w.BZ_Onbeforeunload_fun && w.BZ_Onbeforeunload_fun!=_beforeunload)){
      w.BZ_Onbeforeunload=_beforeunload;
      if(_beforeunload){
        _beforeunload=function(){
          _TWHandler._setOnbeforeunload(w.BZ_Onbeforeunload());
        };
        if(w.onbeforeunload){
          w.onbeforeunload=_beforeunload;
        }else{
          _TWHandler._checkJQueryEvent().beforeunload[0].handler=_beforeunload;
        }
      }
      w.BZ_Onbeforeunload_fun=_beforeunload;
    }
    if(w.BZ_Alert){
      return;
    }
    w.BZ_Alert=w.alert;
    w.BZ_Confirm=w.confirm;
    w.BZ_Prompt=w.prompt;
    
    w.alert=function(m){
      _TWHandler._setAlert(m);
    };
    w.confirm=function(_msg){
      var v= _TWHandler._triggerConfirm(_msg);
      return v;
    };
    w.prompt=function(_msg){
      var v=_TWHandler._triggerPrompt(_msg)
      return v
    };
  },
  _takeoverAjax:function(_win){
    var p=_win.XMLHttpRequest.prototype
    if(!p.BZ_Ajax||p.open==p.BZ_Ajax){
      _TWHandler._setBZSent({i:0,_root:_win.parent==_win});
      p.BZ_Ajax=p.open;
      p.open=function(a,b,c){
        var o=this;
        var _host=_Util._retrieveHostFromUrl(b)
        if(!_host){
          _host=location.protocol+"/"+"/"+location.host;
        }
        o.url=b;

        o.m=a;
        _TWHandler._curAPI={url:b,method:a,host:_host}

        this.BZ_ReceiveAjax=function(url){
          if((o.readyState==4 || o._time && Date.now()-o._time>1000) && url==o.url){
            _TWHandler._setBZSent({i:-1,_root:_win.parent==_win,url:b});
            bzTwComm._postToExt({_fun:"_setRequestCount",_args:[{_url:o.url,i:-1}],_scope:"_TWHandler"});
            _TWHandler._setResponse({data:o.response,url:o.url,m:o.m,status:o.status,host:_host});
          }else{
            if(o._send && o.readyState==0 && !o._time){
              o._time=Date.now()
            }
            var a=this;
            _win.setTimeout(function(){
              a.BZ_ReceiveAjax(url)
            },0);
          }
        };
        _win.setTimeout(function(){
          o.BZ_ReceiveAjax(b)
        },0);
        if(c!==undefined){
          return this.BZ_Ajax(a,b,c);
        }else{
          return this.BZ_Ajax(a,b);
        }
      };

      if(!p.BZ_SetHeader||p.BZ_SetHeader==p.setRequestHeader){
        p.BZ_SetHeader=p.setRequestHeader;
        
        p.setRequestHeader=function(a,b){
          this._headers=this._headers||{}
          if(this._headers[a]!==b){
            this._headers[a]=b
          }
          this.BZ_SetHeader(a,b)
        }
      }

      if(!p.BZ_AjaxSend||p.BZ_AjaxSend==p.send){
        p.BZ_AjaxSend=p.send;
        p.send=function(a,b,c){
          bzTwComm._postToExt({_fun:"_setRequestCount",_args:[{_url:this.url,i:1}],_scope:"_TWHandler"});
          _TWHandler._setBZSent({i:1,_root:_win.parent==_win,url:this.url,m:this.m});
          this._send=1;
          _TWHandler._setAjaxRequest(a,this._headers)
          return this.BZ_AjaxSend(a,b,c);
        };
      }
      
      let _bzFetch=_win.fetch
      _win.fetch=function(a,b,c){
        let _url=a.url||a
        let _host=_Util._retrieveHostFromUrl(_url)
        let m=a.method?a.method:b?b.method:"GET"
        let _body=(a&&a.body)||(b&&b.body)||b
        let _headers=(a&&a.headers)||(b&&b.headers)||b||{}
        _TWHandler._curAPI={url:_url,method:m,host:_host}
        bzTwComm._postToExt({_fun:"_setRequestCount",_args:[{_url:_url,i:1}],_scope:"_TWHandler"});
        _TWHandler._setBZSent({i:1,_root:_win.parent==_win,url:_url,m:m});

        let _featchResult=_bzFetch(a,b,c)
        _featchResult.then(x=>{
          x=x.clone()
          _TWHandler._setAjaxRequest(_body,_headers)
          setTimeout(()=>{
            _TWHandler._setBZSent({i:-1,_root:_win.parent==_win,url:_url});
            bzTwComm._postToExt({_fun:"_setRequestCount",_args:[{_url:_url,i:-1}],_scope:"_TWHandler"});
            try{
              let _contentType=x.headers.get('content-type')||""
              if(_contentType.includes("json")){
                x.json().then(xx=>{
                  let d={data:xx,url:_url,m:m,status:x.status,host:_host}
                  _TWHandler._setResponse(d);
                })
              }
            }catch(e){}
          },100)
        },_err=>{
          _TWHandler._setBZSent({i:-1,_root:_win.parent==_win,url:_url});
         // throw _err
        })
        return _featchResult
      }
      
      _TWHandler._ajaxReady=1
      if(bzTwComm._isApp()){
        console.log("set ajax to control")
        let d={_fun:"_setAjaxReady",_args:[1],_scope:"_TWHandler"}
        bzTwComm._postToExt(d);
        bzTwComm._postToIDE(d);
      }
    }
  },
  _setRequestCount:function(v){
    if(_TWHandler._isIgnoreRequest(v._url)){
      return
    }
    if(v.i==-1){
      _TWHandler._curRequestList.find((x,i)=>{
        if(x._url==v._url){
          _TWHandler._curRequestList.splice(i,1)
          return 1
        }
      })
    }else{
      _TWHandler._curRequestList.push(v)
    }
  },
  _takeoverSocket:function(_win){
    var p=_win.WebSocket.prototype
    if(!p._bzSocketSend||p._bzSocketSend==p.send){
      p._bzSocketSend=p.send
      p.send=function(_msg,bz){
        if(!bz){
          // console.log("lws-sent: ")
          // console.log(_msg)
          _TWHandler._setBZSent({i:1,_root:_win.parent==_win,m:"socket",url:this.url});
          _TWHandler._setAjaxRequest({data:_msg,url:this.url})

          if(!_win._bzSocket){
            // console.log("set message")
            _win._bzSocket=this
            _win._bzSocket.addEventListener("message",function(e){
               // console.log("lws-received: -1")
              // console.log(e.data)
              var o=_win._bzSocket
              _TWHandler._setBZSent({i:-1,_root:_win.parent==_win,m:"socket",url:this.url});
              _TWHandler._setResponse({data:e.data,url:o.url});
            })
          }
        }
        this._bzSocketSend(_msg)
      }
    }
  },
  _setAjaxReady:function(v){
    _TWHandler._ajaxReady=v
  },
  _isTakeoverReady:function(){
    return _TWHandler._ajaxReady
  },
  _enableLocalAjax:function(){
    
  },
  _setResponse:function(o){
    o.url=_Util._mergeURL(location.protocol+"/"+"/"+location.host,o.url)
    if(bzTwComm._isApp()){
      bzTwComm._postToIDE({_fun:"_attachRepData",_args:[o],_scope:"_appReqRepHandler"});
    }else if(bzTwComm._isIDE()){
      _appReqRepHandler._attachRepData(o);
    }
  },
  _setAjaxRequest:function(v,_headers){
    if(bzTwComm._isApp()){
      if(v){
        if(_TWHandler._curAPI){
          _TWHandler._curAPI.data=v
        }else{
          _TWHandler._curAPI=v
        }
      }
      
      v=_TWHandler._curAPI
      if(_headers&&v){
        v.contentType=_headers["Content-Type"]||_headers["content-type"]
        v.headers=JSON.stringify(_headers)
      }
      _TWHandler._curAPI=0

      bzTwComm._postToExt({_fun:"_postAPIData",_args:[v],_scope:"_TWHandler"});
    }
  },
  _takeoverForm:function(w){
    var fs=w.document.getElementsByTagName("form")
    for(var i=0;i<fs.length;i++){
      var f=fs[i]
      if(!f._bzForm){
        f._bzForm=1
        f._orgForm=f.onsubmit
        
        f.onsubmit=function(a,b,c){
          var r=0
          if(f._orgForm){
            r=f._orgForm(a)
          }
          if(r!==false){
            var d={}
            for(var n=0;n<this.elements.length;n++){
              var nn=this.elements[n]
              if(nn.name){
                d[nn.name]=nn.value
              }
            }
            _TWHandler._setAjaxRequest({data:d,url:this.action,method:this.method.toUpperCase()})
          }

          return r
        }
      }
    }
  },
  _postAPIData:function(v){
    // if(_TWHandler._curMode!="_api"){
      // return
    // }
    if(!BZ._autoRecording){
      _TWHandler._setToken(v)

      v.url=_Util._mergeURL(location.protocol+"/"+"/"+location.host,v.url)
      
      bzTwComm._postToIDE({_fun:"_attachReqData",_scope:"_appReqRepHandler",_args:[v]})
    }
  },
  _setToken:function(v){
    if(v.headers&&window.name!="bz-master"){
      try{
        let r={_tokenHost:_apiHandler._getHostIdx(v.url),tokenValue:""}
        if(r._tokenHost===undefined){
          return
        }
        var h=_Util._strToJson(v.headers)
        let a=_IDE._data._setting.authList.find(x=>x.hostToken==r._tokenHost)
        var ts=a.tokenKey.split(/, */)
        if(ts.find(t=>{
          if(h[t]){
            if(!r.tokenValue){
              r.tokenValue={}
            }
            r.tokenValue[t]=h[t]
          }else{
            return 1
          }
        })){
          return
        }
        
        // if(_Util._isSameObj(_aiAuthHandler._getToken(r._tokenHost),r.tokenValue)){
        //   return
        // }
        _TWHandler._token=r

        bzTwComm._postToIDE({_fun:"_setToken",_scope:"_aiAuthHandler",_args:[r]})
      }catch(e){}
    }
  },
  _isIgnoreRequest:function(v){
    var rs=_IDE._data._curVersion.setting.content.ignoreRequest
    if(rs && v){
      var ws=rs.trim().split("\n")
      for(var i=0;i<ws.length;i++){
        if(v.includes(ws[i].trim())){
          return 1
        }
      }
    }
  },
  _setBZSent:function(d,_win){
    if(!bzTwComm._isApp() && d.url&&_TWHandler._isIgnoreRequest(d.url)){
      return
    }
    if(d.i){
      _TWHandler._endTime=Date.now()
      if(!_TWHandler.BZ_sent){
        this._startRequest=Date.now()
      }
      _TWHandler._dataList=_TWHandler._dataList||{}
      var _url=d.m+":"+d.url
      if(d.i>0){
        if(!_TWHandler._dataList[_url]){
          _TWHandler._dataList[_url]=1
          _TWHandler.BZ_sent+=1;
        }
      }else{
        if(_TWHandler._dataList[_url]){
          _TWHandler.BZ_sent-=1;
          delete _TWHandler._dataList[_url]
        }
      }
      
      if(this._startRequest && Date.now()-this._startRequest>_TWHandler._resetTime && _TWHandler.BZ_sent==1){
        _TWHandler.BZ_sent=0;
        if(_TWHandler._resetTime>6000){
          _TWHandler._resetTime/=2;
        }
      }

    }else if(d._root){
      _TWHandler._lastSent=0;
      _TWHandler.BZ_sent=0;
    }
    if(bzTwComm._isApp()){
      bzTwComm._postToIDE({_fun:"_setBZSent",_args:[d],_scope:"_TWHandler"});      
    }else if(bzTwComm._isIDE()&&!BZ._isPlaying()&&d._root&&!d.url){
      _extensionComm._exeFun("_setUIData","_IDE._innerWin",{_dataBind:{_showDataBind:_IDE._innerWin._data._dataBind._showDataBind}});
    }
    //_console(" ------------- "+d.i+":"+d.m+":"+d.url+":"+_TWHandler.BZ_sent);
  },
  _bzOnBeforeUnload:function(){
    _bzDomPicker._cancel();
    _TWHandler._pageReloading=1;
    BZ._documents=0;
    BZ._data._hasTW=0;
    BZ.TW.bzReloading=1;
    //if(window.bzTwComm){
      bzTwComm._postToIDE({_fun:"_infoLoadingNewPage",_args:[1],_scope:"_extensionComm"});
    //}
  },
  _bzUnload:function(){
    _TWHandler._pageReloading=1;
    BZ._documents=0;
    BZ._data._hasTW=0;
    if(!BZ._isAutoRunning()){
      setTimeout(function(){
        try{
          _IDE._innerWin._insertCtrls();
        }catch(e){}
      },1000);
    }
    BZ.TW.bzReloading=1;
    if(BZ.TW._userUnload && BZ.TW.onunload.toString()!=BZ.TW._userUnload.toString()){
      if(BZ.TW._userUnload.constructor==Function){
        return BZ.TW._userUnload();
      }else{
        return _Util._eval(BZ.TW._userUnload);
      }
    }
  },
  _setDataFromContentToPage:function(n,v){
    $("<button style='display:none;' onclick=''></button>").click().remove()
  },
  _setUnload:function(){
    if(!window.BZ){
      return;
    }

    window.onbeforeunload=0
    BZ.TW.onbeforeunload=_TWHandler._bzOnBeforeUnload;
    
    if(!BZ.TW || BZ.TW.closed || BZ.TW._userUnload){
      return;
    }else{
      if(BZ.TW.onunload && BZ.TW.onunload!=_TWHandler._bzUnload){
        BZ.TW._userUnload=BZ.TW.onunload;
      }

      BZ.TW.onunload=_TWHandler._bzUnload;
    }
  },
  _isAfterRequest:function(){
    var v=0,t=60000;
    if(bzTwComm._isIDE()){
      v= !_TWHandler.BZ_sent || _TWHandler.BZ_sent<0;
      t=6000;
    }else{
      v=((!_TWHandler.BZ_sent || _TWHandler.BZ_sent<0) && !_TWHandler._pageReloading) || (BZ.TW && !BZ.TW.XMLHttpRequest.prototype.BZ_Ajax)
    }
    if(!v){
      this._lastAfterRequest=this._lastAfterRequest||Date.now();
      if(Date.now()-this._lastAfterRequest>t){
        this._lastAfterRequest=0
        return 1
      }
    }else{
      this._lastAfterRequest=0
    }
    return v;
  },
  _takeoverOpenWin:function(_win){
    // let _key=performance.now()
    // console.log("_takeoverOpenWin:"+_key)
    _win=_win||window
    if(bzTwComm._isExtension()){
      // console.log("1:"+_key)
      bzTwComm._postToApp({_fun:"_takeoverOpenWin",_scope:"_TWHandler"})
      return
    }else if(bzTwComm._isIDE()){
      // console.log("2:"+_key)
      return;
    }
    _win=_win||window
    if(_win.BZ_PopOpen&&_win.BZ_PopOpen!=_win.open){
      // console.log("3:"+_key)
      return;
    }
    _win.BZ_PopOpen=_win.open;
    _win.open=function(_url,_name,_option,_replace){
      if(_name!="BZ-In-Testing" && !window.BZ){
        var fs=window.document.getElementsByTagName("IFRAME");
        for(var i=0;i<fs.length;i++){
          if(fs[i].name==_name){
            return _win.BZ_PopOpen(_url,_name,_option,_replace);
          }
        }
      }else if(_name=="BZ-In-Testing" || _Util._getDomsByTagAndName("IFRAME",_name).length){
        return _win.BZ_PopOpen(_url,_name,_option,_replace);
      }
      var _pop=_win.BZ_PopOpen(_url,"_"+"se"+"lf",_option,_replace);

      setTimeout(function(){
        if(_pop&&_pop.closed){
          _win.BZ_PopOpen(_url,"_"+"se"+"lf",_option,_replace);
        }
      },1000)
      return _pop
    }
  },
  _setAlert:function(_msg){
    if(bzTwComm._isApp()){
      bzTwComm._postToExt({_fun:"_setAlert",_args:[_msg],_scope:"_TWHandler"})
    }else{
      _TWHandler._popActual.alert.push(_msg+"");
    }
  },
  _setOnbeforeunload:function(_msg){
    if(_msg){
      if(bzTwComm._isApp()){
        bzTwComm._postToExt({_fun:"_setOnbeforeunload",_args:[_msg],_scope:"_TWHandler"})
      }else{
        _TWHandler._popActual.onbeforeunload.push(_msg+"");
      }
    }
  },
  _triggerConfirm:function(_msg){
    if(bzTwComm._isApp()){
      bzTwComm._postToExt({_fun:"_triggerConfirm",_args:[_msg],_scope:"_TWHandler"})
      return true
    }
    var a = _TWHandler._popActual.confirm;
    a.push(_msg+"");
    var aa=_TWHandler._popExpected.confirm;
    var rv=true;
    if(aa && aa[a.length-1]!==undefined){
      // eval("rv="+aa[a.length-1].returnValue);
      rv=aa[a.length-1].returnValue;
      aa.pop();
      a.pop();
    }
    return rv;
  },
  _triggerPrompt:function(_msg){
    if(bzTwComm._isApp()){
      bzTwComm._postToExt({_fun:"_triggerPrompt",_args:[_msg],_scope:"_TWHandler"});
      if(document.getElementById("bzPopReturnData")){
        var v= document.getElementById("bzPopReturnData").innerText;
        try{
          var vv=JSON.parse(v)
          if(vv.constructor==Array){
            v=vv.shift().returnValue
            if(vv.length){
              document.getElementById("bzPopReturnData").innerText=JSON.stringify(vv)
            }
          }
        }catch(e){}
        return v
      }
      return;
    }
    var a = _TWHandler._popActual.prompt;
    a.push(""+_msg);
    var b=_TWHandler._popExpected.prompt;
    
    var rv=false;
    
    if(b && b.length){
      rv=b[0].returnValue;
      if(b.length>1){
        b.shift()
      }
//      _TWHandler._popExpected.prompt.pop();
    }
    return rv;
  },
  _waitFollowingPop:function(_result,_fun,_time){
    if(_TWHandler._popExpected){
      // console.log("has alert setting")
      for(var k in _TWHandler._popExpected){
        var v=_TWHandler._popExpected[k];
        if(v && v.length){
          _time=_time||0;
          _time+=1000;
          if(_time>_domActionTask._getCurExpectReactionTime()){
            return _fun();
          }
          return setTimeout(function(){
            _TWHandler._waitFollowingPop(_result,_fun,_time)
          },1000);
        }
      }
    }
    _fun();
  },
  _isAfterHashLoad:function(w){
    if(w.location.pathname==_TWHandler._lastPageInfo._pathname && (w.location.hash || w.location.href.endsWith("#"))){
      if(w.location.hash==_TWHandler._lastPageInfo._hash){
        return true;
      }else if(w.location.hash && $(w.document.body).html()!=_TWHandler._lastPageInfo.html){
        return true;
      }else if(Date.now()-_TWHandler._lastPageInfo.time>2000){
        return true;
      }
    }
    return false;
  },
  _exeAfterLoad:function(_bFirst,_fun){
    // console.log("_exeAfterLoad")
    var w=BZ.TW;
    try{
      var t=Date.now();
      _TWHandler._enteredNewPage=false;
      BZ._prepareDocument(function(){
        t=(Date.now()-t)/3;
        if(t>3000){
          t=3000;
        }else if(500>t){
          t=500;
        }
        setTimeout(function(){
          _TWHandler._afterNewPageOpened(_fun);
        },t);
      });
    }catch(e){
      if(_bFirst){
        setTimeout(function(){
          _TWHandler._exeAfterLoad(false,_fun);
        },100);
      }else{
        _Util._alertMessage(e.message,e);
      }
    }  
  },
  _getPopWinSize:function(h){
    if(window.screenX>0){
      window.moveTo(-7,0);
    }
    var ws=BZ._userHabit.popSize[h],
        w=screen.width-window.outerWidth
    if(!ws){
      ws="height="+screen.availHeight+",top=0,";
      if(window.outerWidth>screen.width*0.7){
        ws+="left=0,width="+screen.width
      }else{
        ws+="left="+window.outerWidth+window.screenX+",width="+(w)
      }
    }else if(ws.match(/^[0-9 x#%]+$/)){
      ws=ws.split("x").map(x=>x.trim())
      if(!ws[1]){
        ws[1]=screen.height
      }
      if(ws[0].includes("%")){
        ws[0]=screen.width*(parseInt(ws[0])/100)
      }
      ws=`width=${ws[0]},height=${ws[1]},top=0,left=${w>ws[0]?window.outerWidth+window.screenX:screen.width-ws[0]}`
    }
    return ws;
  },
  _addTWChecker:function(_fun,_timer){
    var _errorProcess=0,_timer=_timer||0
    clearTimeout(_TWHandler._checkTW)

    return _TWHandler._checkTW=setTimeout(function(){
      if(_timer>1){
        return _startErrorProcess()
      }else if(!BZ._isPlaying()){
        return
      }
      _timer++
      if(!BZ.TW){
        _crash()
      }else if(BZ.TW.closed){
        _crash()
      }else{
        if(bzTwComm._isIDE()){
          _startErrorProcess()
          _extensionComm._retrieveDataFromTW("name",function(v){
            _clearErrProcess()
            _TWHandler._addTWChecker(_fun,_timer)
          },1)
        }else{
          try{
            BZ.TW.document
            _TWHandler._addTWChecker(_fun,_timer)
          }catch(e){
            _crash()
          }
        }
      }
    },120000)//2min
    function _startErrorProcess(){
      _errorProcess=setTimeout(function(){
        if(_TWHandler._checkTW){
          _crash()
        }
      },2000)
    }
    function _clearErrProcess(){
      clearTimeout(_errorProcess)
      _TWHandler._checkTW=0
    }
    function _crash(){
      if(_fun){
        _fun(-1)
      }
      _ideTask._crash()
    }
  },
  _clearTWChecker:function(){
    clearTimeout(_TWHandler._checkTW)
    _TWHandler._checkTW=0
  },
  //h:window size,
  //_again: try again,
  _openUrl:function(_enterPointValue,_callBack,h,_again){
    window.$project&&(window.$project.$flag="")

    let _final=0

    if(_enterPointValue){
      _enterPointValue=_domActionTask._setCurValue(_enterPointValue)
    }
    if(h===undefined&&!_ideTestManagement._getCurHost()){
      BZ._setStatus("")
      BZ._setHash("settingEnvironment")
      return alert(_bzMessage._system._error._missHost)
    }
    var ws=this._getPopWinSize(h);
    if(!_enterPointValue){
      if(window.inPlugIn){
        _extensionComm._openURL(_enterPointValue,ws);
      }else{
        BZ.TW=window.open(_enterPointValue,_TWHandler._getClientName(),ws);
      }
      return _callBack&&_callBack()
    }
    _TWHandler._addTWChecker(_finalFun);
    if(window.inPlugIn){
      if(!_extensionComm._alertExtensionRequest()){
        _extensionComm._openURL(_enterPointValue,ws,_finalFun);
      }else if(BZ._isAutoRunning()){
        // console.log("BZ-LOG: No extension issue and stop task!")
        _ideTask._end()
      }
      
      return;
    }
    
    try{
      if (BZ.TW && !BZ.TW.closed){
        BZ.TW.BZOldPage=true;
      }else{
        BZ.TW=null;
      }

      _TWHandler._lastPageInfo={
        _pathname:BZ.TW?BZ.TW.location.pathname:null,
        _hash:BZ.TW?BZ.TW.location.hash:null,
        _html:BZ._documents?BZ._documents._getBodyHtml():"",
        time:Date.now()
      };
      var _doc=BZ.TW?BZ.TW.document:null;
      if(BZ.TW && !BZ.TW.closed){
        if(_Util._loadInHash(_enterPointValue,BZ.TW.location)){
          _doc=null;
        }
      }
      this._setUnload();
      // // console.log("BZ-LOG: openUrl - "+_enterPointValue);
      BZ.TW=window.open(_enterPointValue,_TWHandler._getClientName(),ws);
      _TWHandler._curLoadingURL=_enterPointValue;
      BZ._checkPopBlocking(_enterPointValue,_callBack);
      BZ._prepareDocument(function(){
        _TWHandler._exeAfterLoad(true,_finalFun);
      },_doc);
    }catch(e){
      return e.message;
    }

    function _finalFun(a,b,c){
      return _callBack&&_callBack(a,b,c)
      // // console.warn("lws")
      // // console.log("BZ-LOG: after open url: "+JSON.stringify(a))
      // // console.warn("BZ-LOG: after open url"+JSON.stringify(a))
      // if(!_again&&_final){
      //   /*************************************/
      //   //Maybe should take back

      //   BZ._closePopWindow()
      //   return _TWHandler._openUrl(_enterPointValue,_callBack,h,1)

      //   //Maybe should take back
      //   /*************************************/
      // }
      // _final=1
      // _TWHandler._clearTWChecker()
      // // console.log("BZ-LOG: finalFun 1")
      // if(a!==-1&&_callBack){
      //   console.log("BZ-LOG: before checkTWReady")
      //   _TWHandler._checkTWReady(function(){
      //     return _callBack(a,b,c)

      //     console.log("BZ-LOG: before checkTWReady 1")
      //     _TWHandler._checkTWData(function(){
      //       if(_callBack){
      //         console.log("BZ-LOG: before checkTWReady 2")
      //         _callBack(a,b,c)
      //         _callBack=0
      //       }
      //     })
      //   },_enterPointValue)
      // }else{
      //   _callBack=0
      // }
    }
  },
  _getClientName:function(){
    return "bz-client"
    // let n="bz-client"
    // if(BZ._isPlaying()){
    //   n+="-playing"
    // }
    // return n
  },
  _checkTWReady:function(_fun,_enterPointValue){
    // if(!BZ._isPlaying()){
      // return
    // }
    setTimeout(()=>{
      let _time=_time2=0
      let t=BZ._getCurHost
      let _loadPageTime=_IDE._data._setting.advanced[_ideTestManagement._getCurServerId()].loadPageTime||60000
  
      if(bzTwComm._isIDE()){
        let i=0;
        _TWHandler._reloadPageOnCheckTWReady=0
        let _timer=setInterval(function(){
          if(!BZ._isPlaying()&&!_fun){
            console.log("BZ-LOG: STOP check APP Ready")
            return clearInterval(_timer)
          }
          console.log("BZ-LOG: check app ready")
          _extensionComm._retrieveDataFromTW("window._TWHandler&&window._TWHandler._responseReady()",function(v){
            console.log("BZ-LOG: retry for wait location.href:"+v)
            _time++
            if(v){
              console.log("BZ-LOG: Get APP Ready")
              clearInterval(_timer)
              _TWHandler._reloadPageOnCheckTWReady=0
              _fun()
            }else if(_time>30){
              _fun()
            }
          },1)
          
          _time2+=50
          //if no response from app in 20s, stop checking
          if(_time2>_loadPageTime){
            console.log("BZ-LOG: STOP on try too many")
            clearInterval(_timer)
            if(!_TWHandler._reloadPageOnCheckTWReady){
              _TWHandler._reloadPageOnCheckTWReady=1
              BZ._closePopWindow()
              console.log("BZ-LOG: TWHandler 2")
              return _TWHandler._openUrl(_enterPointValue,_fun)
            }
          }
        },50)      
      }else{
        _fun()
      }
    },0)
  },
  _responseReady:function(){
    return location.href
  },
  _afterNewPageOpened:function(_fun){
    // console.log("_afterNewPageOpened")
    if(!_TWHandler._enteredNewPage){
      _TWHandler._enteredNewPage=true;
    }else{
      return;
    }
    _TWHandler._takeoverWin();
    if(_fun){
      _fun();
    }else{
      _IDE._innerWin._insertCtrls();
    }
  },
  _isSameDomain:function(_url){
    if(_url && _url.indexOf("http")!=0 && _url.includes(":/"+"/")){
      return false;
    }
    return !_url || _url.startsWith("javascript:") || (_url.indexOf("http")!=0 && _url.indexOf("/"+"/")!=0) || _url.indexOf(location.origin)==0;
  },
  _checkJQueryEvent:function(e){
    try{
      return $["_"+"data"](e,"events") || {};
    }catch(e){}
    return {};
  }
};var _domActionTask={
  _handleMonitorUrl:function(r){
    if(BZ._isPlaying()){
      for(let k in _domActionTask._curMonitorUrlFun){
        try{
          if(_domActionTask._curMonitorUrlFun[k](r.url)){
            delete _domActionTask._curMonitorUrlFun[k]
          }
        }catch(e){
          _ideReport._logErrInfo(_bzMessage._action._monitorUrlError+"\n"+k+"\n"+e.message)
        }
      }
    }
  },
  _findElement:function(o,p){
    if(!o.e){
      if(o.panels){
        o.e=_Util._findDomWithPanels(o.element,o.panels,p)
      }else{
        if(o.event&&o.event._valueKey){
          if(o.qpath){
            try{
              o.e=$util.findDom(o.qpath,p);
              if(o.e){
                return o.e
              }
            }catch(e){}
          }
          o.e=_cssHandler._findInputByLabel(o.element,o.event._valueKey)
          if(o.e){
            if(o.e._bzPath){
              o.element=o.e._bzPath
            }else{
              o.element=_cssHandler._findPath(o.e,0,3)
              window.$newElement=o.qpath=_Util._getQuickPath(o.e)
            }
          }
          return o.e
        }else{
          o.e=$util.findDom(o.element,p);
        }
      }
    }
    return o.e
  },
  _getCurMaxWaitTime:function(a){
    return a.max||a.min||_domActionTask._getCurExpectReactionTime()
  },
  _getCurExpectReactionTime:function(){
    return _domActionTask._getCurAdvancedSetting().expectReactionTime
  },
  _getCurAdvancedSetting:function(){
    let t=BZ._getCurTest()
    t=t&&t._data.hostId
    return _IDE._data._curVersion.setting.advanced[t||0]
  },
  _exeResultScript:function($result,r){
    var _tmpStatus=$result.status
    try{
      let f;
      try{
        f=_Util._eval("f="+r._data.resultscript,{$result:$result})
        if(f&&f.constructor==Function){
          f()
        }
      }catch(ee){
        _Util._eval(`(()=>{\n${r._data.resultscript}\n})()`,{$result:$result})
        if(f&&f.constructor==Function){
          f()
        }
      }
      let b=$result.break;
      if(_tmpStatus!=$result.status){
        r._type=$result.status=="success"?4:$result.status=="warning"?3:$result.status=="failed"?2:1
      }
      if(b){
        r._bzSkip=0
        r._bzEnd=b=="bz-end"
        r._bzStop=b=="bz-stop"
        r._bzSkipGroup=b=="bz-skip-group"
        r._continue=b=="bz-continue"
      }
    }catch(e){
      r._type=2
      r._msg=_bzMessage._test._tab.resultscript+": "+e.message
    }
  },
  _buildTaskAction:function(a,t,i,q){
    var o=a._orgData||a;
    a=_Util._clone(o);
    a._orgData=o;
    a._supData=t;
    a._path=_ideLocation._getPath(0,t._supData,t)+(i+1)+"/";
    a._idx=i;
    if(!bzTwComm._isExtension()){
      a._level=_ideTask._level;
    }

    a.description=a.stepKey||!a.description?_ideActionManagement._getAutoDescription(a,1).trim():a.description
    q&&q.unshift(a);
    return a
  },
  _gotoFlag:function(s,as){
    if(BZ._isPlaying()&&s){
      let t=BZ._getCurTest()._data.code,
          m=BZ._getCurModule()._data.code,
          a,vs=[];
          
      if(!as&&!bzTwComm._isExtension()){
        as=_ideTask._data._taskQueue
      }
      while(a=as.shift()){
        vs.push(a)
        try{
          if(a._supData.code==t&&a._supData._supData.code==m){
            if(s==".."||s=="bz-stop"){
              continue
            }
            if(s=="..."||s=="bz-skip-group"){
              if(!a.inGroup||a.type==7){
                as.unshift(a)
                return
              }
            }
            if(!a.inGroup&&a.flag==s){
              as.unshift(a)
              return
            }
          }else{
            if(s==".."||s=="..."||s=="bz-stop"||s=="bz-skip-group"){
              as.unshift(a)
            }else{
              a=0
            }
            break
          }
        }catch(e){}
      }
      while(!a&&vs.length){
        as.unshift(vs.pop())
      }
    }
  },
  /*
  1:"Element appears",
  2:"Element appears and disappears",
  3:"Element appears and click",
  4:"Element appears and double click",
  5:"Element disappears",
  6:"Element disappears and appears again",
  7:"Element disappears and appears again and click",
  8:"Element disappears and appears again and double click",
  */
  _preCkRepElement:function(a,_result){
    //The action already completed in last page.
    var t=_taskInfo._type,
        md=a.event.repElementMethod;
    if(!md||!a.event.responseElement){
      return 
    }
    _result._startTime=Date.now()
    var o=$util.findDom(a.event.responseElement)
    if(o&&!_Util._isHidden(o)){
      _result._repElement=o
    }
    if("a1234".includes(md)){
      if(o&&!_Util._isHidden(o)){
        _result._type=t._error
        _result._msg=_bzMessage._task._repElementAppearBeforeExeError
      }
    }else{
      if(!o){
        _result._type=t._error
        _result._msg=_bzMessage._task._missBeginningRepElementError
      }
    }
  },
  /*
  1:"Element appears",
  2:"Element appears and disappears",
  3:"Element appears and click",
  4:"Element appears and double click",
  5:"Element disappears",
  6:"Element disappears and appears again",
  7:"Element disappears and appears again and click",
  8:"Element disappears and appears again and double click",
  */
  _ckRepElement1:function(a,_result,_fun){
    let t=_taskInfo._type,md=a.event.repElementMethod;
    _result._pTime=Date.now()-_result._startTime;
    if(!md||!a.event.responseElement){
      return _fun(_result)
    }
    if("a1234".includes(md)){
      var o=$util.findDom(a.event.responseElement)
      if(o&&!_Util._isHidden(o)){
        if(md==2){
          _result._repElement=o
          return _domActionTask._ckRepElement2(a,_result,_fun)
        }else if(3==md){
          _domActionTask._clickElement(o)
        }else if(4==md){
          _domActionTask._dblclickElement(o)
        }
        return _fun(_result)
      }
    }else{
      if(_Util._isHidden(_result._repElement)){
        if(md!=5){
          return _domActionTask._ckRepElement2(a,_result,_fun)
        }
        return _fun(_result)
      }
    }
    let _time=parseInt(a.max||2000)
    if(_result._pTime>_time){
      _result._type=t._error
      if("a1234".includes(md)){
        _result._msg=_bzMessage._task._repElementAppearFailed
      }else{
        _result._msg=_bzMessage._task._repElementDispearFailed
      }
      return _fun(_result)
    }else{
      if(_reExe(a)){
        a._reTrigger=1
        if($(document).find(a.e)[0]){
          return _domActionTask._trigger(a,function(r){
            _domActionTask._ckRepElement1(a,_result,_fun)
          })
        }else{
          _result._type=1
          _result._msg=_bzMessage._system._error._lostElement
          return _fun(_result)
        }
      }
      BZ._setTimeout(function(){
        _domActionTask._ckRepElement1(a,_result,_fun)
      },10)
    }
    
    function _reExe(a){
      if(md=="a"){
        _result._retryTimes=_result._retryTimes||0
        let _speed=Math.max(parseInt(a.event.repInterval)||(_time/10),1000)
        if(parseInt(_result._pTime/_speed)>_result._retryTimes){
          _result._retryTimes++
          return 1
        }
      }
    }
  },
  /*
  2:"Element appears and disappears",
  6:"Element disappears and appears again",
  7:"Element disappears and appears again and click",
  8:"Element disappears and appears again and double click",
  */
  _ckRepElement2:function(a,_result,_fun){
    var t=_taskInfo._type,md=a.event.repElementMethod;
    _result._pTime=Date.now()-_result._startTime;
    if(!md||!a.event.responseElement){
      return _fun(_result)
    }
    if("678".includes(md)){
      var o=$util.findDom(a.event.responseElement)
      if(o&&!_Util._isHidden(o)){
        if(md==7){
          _domActionTask._clickElement(o)
        }else if(md==8){
          _domActionTask._dblclickElement(o)
        }
        return _fun(_result)
      }
    }else{
      if(_Util._isHidden(_result._repElement)){
        return _fun(_result)
      }
    }
    var t=a.max||2000
    if(Date.now()-_result._startTime>t){
      _result._type=t._error
      if(4==md){
        _result._msg=_bzMessage._task._repElementAppearFailed
      }else{
        _result._msg=_bzMessage._task._repElementDispearFailed
      }
      return _fun(_result)
    }else{
      BZ._setTimeout(function(){
        _domActionTask._ckRepElement2(a,_result,_fun)
      },10)
    }
  },
  _clickElement:function(o,_fun){
    _domActionTask._isLoading(function(){
      $util.triggerMouseEvents(o,1,0,0,0,0,0,_fun)
    })
  },
  _dblclickElement:function(o,_fun){
    _domActionTask._isLoading(function(){
      $util.triggerDblClickEvents(o,1,0,0,0,0,0,_fun);
    })
  },
  _showIssueInComment:function(_result){
    var _element,_data=_result._data||_IDE._data._curAction,_chkSize;
    if(_result._errSou==_taskInfo._errSou._exp){
      _element=_data.element;
    }else{
      _element=$.extend([],_data.element);
      while(_element.length>1){
        var e=$util.findDom(_element)
        if(e){
          if(_chkSize){
            let r=e.getBoundingClientRect()
            while(r.width<500||r.height<500&&e.tagName!="BODY"){
              e=e.parentElement
              r=e.getBoundingClientRect()
            }
            _element=_cssHandler._findPath(e)
          }
          break
        }
        _chkSize=1
        _element.pop();
      }
      if(_element.length==1){
        _element.push("*:eq(0)","0")
      }
    }

    _bzDomPicker._removeTmpCover();
    _domActionTask._doComment({description:_result._msg,element:_element});    
    return _element;
  },
  _setCurValue:function(v){
    v=_JSHandler._prepareData(v);
    if(_Util._isRegexData(v)){
      v=$util.generateWordsByRegex(v)
    }
    return v
  },
  _prepareRequest:function(v,_result){
    var _host=""
    let _parameter=window.$parameter
    
    if(_parameter.$result){
      try{
        if(v._preScript){
          let $result
          $result=_parameter.$result[_result.idx]
          let $parameter={}
          _Util._eval(v._preScript,{$parameter:$parameter,$result:$result})
          _parameter=$parameter
        }else if(v._defParameter){
          _parameter=v._defParameter
        }
      }catch(e){
        throw new Error(e.message)
      }
    }

    if(!_apiHandler._isSocketRequest(v)){
      if($.isNumeric(v.host)){
        _host=BZ._curEnv.items[v.host].host
      }
      if(_host.endsWith("/")&&v.url[0]=="/"){
        _host=_host.substring(0,_host.length-1)
      }
      if(v.url.startsWith(_host)||v.url.match(/http[s]*\:\/\/.+/)){
      }else{
        _host+=v.url
        v.url=_host
      }
      delete v.host

      let _url=_JSHandler._prepareData(v.url,0,2,_parameter)
      if(!_url||!_url.split){
        alert("Skipped by empty data on url: "+v.url)
        return
      }
      v.url=_url
      let q=v.query
      if(q&&q.constructor!=Object){
        eval("q="+q)
      }
      v.url=v.url.split("?")[0]
      if(!_Util._isEmpty(q)){
        q=_Util._objToURI(_Util._formatObjectToFinalData(q,_parameter))
        v.url+=q||""
      }
      if(v.headers){
        if(v.headers.constructor==String){
          try{
            eval("v.headers="+v.headers)
          }catch(e){
            try{
              let vv=_Util._parseJSONWithRefDataToObj(v.headers)
              v.headers={}
              vv.forEach(x=>{
                v.headers[x._key]=_Util._removeStringSign(x._value)
              })
            }catch(ex){
              delete v.headers
            }
          }
        }
        if(v.headers&&v.headers.constructor==Object){
          v.headers=_Util._formatObjectToFinalData(v.headers,_parameter)
        }
      }else{
        delete v.headers
      }

      try{
        if(v.contentType&&v.contentType.toLowerCase().includes("json")){
          if(v.data&&v.data.constructor==String){
            v.data=_Util._strToJson(v.data,_parameter)
          }
          if(v.data){
            v.data=_Util._formatObjectToFinalData(v.data,_parameter)
            // v.data=JSON.stringify(v.data)
          }
        }else{
          // v.data=_Util._parameterToObj(v.data)
          v.data=_Util._formatObjectToFinalData(v.data,_parameter)
        }
      }catch(e){          
      }
    }else{
      if(v.data){
        v.data=_JSHandler._prepareData(v.data,0,0,_parameter)
        v.data=_Util._strToJson(v.data,_parameter)
        v.data=_Util._formatObjectToFinalData(v.data,_parameter)
      }
    }
  },
  _prepareItem:function(_setting,a,_result,_funOnSelfCtrl){
    var u=!BZ._isAutoRunning();
    var _element=a.element||a.panel
    if(_apiHandler._isRequestAction(a)){
      return 1
    }else if(a.refCom){
      return 1
    }else if(a.event){
      _domActionTask._setErrorPos(_result,"_eventChange","_actionDetailsGeneral");
      a.event.value=_domActionTask._setCurValue(a.event.value)
      //skip
      if(_isSkip(a.event.value,"_value")){
        _domActionTask._reportAppInfo("Prepare action: value skip")
        return
      }
      _domActionTask._setErrorPos(_result,"_eventKeys","_actionDetailsGeneral");
      a.event.groupKeys=_domActionTask._setCurValue(a.event.groupKeys)
    }
    if(a.expection){
      _domActionTask._setErrorPos(_result,"_expection","_actionDetailsGeneral");
      if(_Util._hasCode(a.expection)){
        a.expection=_domActionTask._setCurValue(a.expection);
      }
      //skip
      if(_isSkip(a.expection,"_expection")){
        _domActionTask._reportAppInfo("Prepare action: expection skip")
        return
      }
    }
    if(a.api){
      _domActionTask._setErrorPos(_result,"_httpURL","_actionDetailsGeneral");
      a.api.httpURL=_JSHandler._prepareData(a.api.httpURL,0,2);
      if(_isSkip(a.api.httpURL,"_url")){
        _domActionTask._reportAppInfo("Prepare action: url skip")
        return
      }

      _domActionTask._setErrorPos(_result,"_httpHeaders","_actionDetailsGeneral");
      a.api.httpHeaders=_JSHandler._prepareData(a.api.httpHeaders);
      if(_isSkip(a.api.httpHeaders,"_headers")){
        _domActionTask._reportAppInfo("Prepare action: api headers skip")
        return
      }

      _domActionTask._setErrorPos(_result,"_httpData","_actionDetailsGeneral");
      a.api.httpData=_JSHandler._prepareData(a.api.httpData);
      if(_isSkip(a.api.httpData,"_httpData")){
        _domActionTask._reportAppInfo("Prepare action: url httpdata skip")
        return
      }
    }else if(a.loadURL){
      a.loadURL=_Util._mergeURL(_ideTestManagement._getCurHost(), _JSHandler._prepareData(a.loadURL,0,2))
    }
    if(_element){
      _element=_cssHandler._getCustomizeElement(_element,a)
      //Update element
      _element=_JSHandler._prepareData(_element);
      /*
      _element.forEach((e,j)=>{
        var w=_descAnalysis._retrieveTextForElementPathItem(e)
        if(_Util._isRegexData(w)){
          _element[j]=_element[j].replace(w,$util.generateWordsByRegex(w))
        }
      })
      */
      //skip
      if(_isSkip(_element,"_element")){
        _domActionTask._reportAppInfo("Prepare action: element skip")
        return
      }
      if(a.element){
        a.element=_element
      }else{
        a.panel=_element
      }
    }
    if(a.element){
      a.element.forEach((ee,j)=>{
        ee=_descAnalysis._retrieveTextForElementPathItem(ee)+""
        if(ee){
          ee=ee.match(/\/\{random:[0-9-]+[^\}]\}[\/]/)
          if(ee){
            ee=ee[0]
            let vv=$util.generateWordsByRegex(ee)
            a.element[j]=a.element[j].replace(ee,vv)
            if(a.event&&a.event.value==ee){
              a.event.value=vv
            }
          }
        }
      })
      if(a.skipActionElement){
        if($util.findDom(a.skipActionElement)){
          _result._bzSkip=1
          _result._pos="_element"
          _result._type=4
          _finalFun()
          
          _domActionTask._reportAppInfo("Prepare action: on skip element setting")
          return
        }
      }
      
      _domActionTask._setErrorPos(_result,"_element","_actionDetailsGeneral");
      _domActionTask._reportAppInfo("Prepare element")

      var e=_domActionTask._findElement(a,a.errOnHidden);
      
      if(!e){
        _domActionTask._reportAppInfo("Prepare action: element-1 not found. HTML size: "+(((document.body||{}).innerHTML||{}).length||0))
        bzTwComm._postToIDE({_fun:"_end",_scope:"_timingInfo",_args:[""]});
        e=_Util._getRandomSelection(a.element)
        
        if(e&&a.event&&a.event.value&&a.event.value.startsWith("/{random")){
          a.event.value=$util.getElementText(e)
          _domActionTask._setRandomValueToVariable(a.event.value,a)
        }
      }
      
      // if(e&&a.finalElement){
      //   e=_findFinalElement(e,a)
      //   if(!e){
      //     _domActionTask._reportAppInfo("Prepare action: element-2 not found")
      //   }
      //   a.e=e
      // }
      
      if(!e){
        _domActionTask._reportAppInfo("Prepare action: element-3 not found")
        if(a.content&&a.content.type=="unexist"){
          _result._type=_taskInfo._type._success
          return _finalFun()
        }else{
          _result._msg=_bzMessage._system._error._testError+"\n"+JSON.stringify(a.element,0,2);
        }
      }
      if(!e&&a.failElement&&$util.findDom(a.failElement)){
        _result._type=_taskInfo._type._failed
        _finalFun()
        return
      }else if(u&&!e&&(!a.content||a.content.type!="unexist")&&(!a.refOfError||a.refOfError.includes("e"))){
        e=_aiElementUpgrade._aiFindElement(a,window.$upgradeDiffs)
        if(!e){
          _result._type=_taskInfo._type._error
          return _finalFun()
        }else if(e._solution=="update"){
          window.$newElement=e;
          a.element=e._path
        }else{
          _result._type=_taskInfo._type._error;
          if(!a._inOneAction){
            e._upgradeList=_aiElementUpgrade._buildUpgradeStrategy(_element,e._path)
            window.$newElement=e;
            var ee=_Util._findTextElement(e._element)
            _screenshotHandler._getScreenshot(ee,0,function(c) {
              window.$newElement._img=c
              _finalFun()
              _bzDomPicker._removeTmpCover();
              _bzDomPicker._showTmpCover([e._element])
            });
          }else{
            _finalFun()
          }
          return 
        }
      }else if(!e){
        _result._type=_taskInfo._type._error
        
        return _finalFun()
      }else{
        if(_Util._isHidden(e)){
          if(a.content&&a.content.type=="unexist"){
            _domActionTask._reportAppInfo("Prepare action: check unexist on hidden element")
            _result._type=_taskInfo._type._success
            return _finalFun()
          }
        }else if(a.offset){
          if(a.e.bzTxtElement){
            var xy = _Util._getDomXY(a.e);
            let aa={
              x:parseFloat(xy.x)+a.e.bzTxtElement.x,
              y:parseFloat(xy.y)+a.e.bzTxtElement.y,
              h:a.e.bzTxtElement.h,
              w:a.e.bzTxtElement.w
            }
            a.e._offset=_bzDomPicker._getOffsetPoint(aa,a.offset)
          }
        }
        if(_cssHandler._lastAllInputsMap){
          var p=_element.join(" ")
          _cssHandler._lastAllInputsMap[p]=e
        }
      }
    }
    return 1
    
    function _isSkip(v,p){
      v=v||""
      if(JSON.stringify(v).match(/bz-skip-group/i)){
        _result._type=_taskInfo._type._success
        _result._bzSkipGroup=1;
        _result._pos=p
        _finalFun()
        return 1
      }else if(JSON.stringify(v).match(/bz-skip/i)){
        _result._type=_taskInfo._type._success
        _result._bzSkip=1;
        _result._pos=p
        _finalFun()
        return 1
      }else if(JSON.stringify(v).match(/bz-stop/i)){
        _result._type=_taskInfo._type._success
        _result._bzStop=1;
        _result._pos=ps
        _finalFun()
        return 1
      }
    }
    function _finalFun(){
      if(_funOnSelfCtrl){
        _funOnSelfCtrl(_result)
      }
    }
  },
  _exeFillForm:function(d,_backFun){
    var r=_taskInfo._type;
    _ideReport._ignoreReport=1
    let o=_domActionTask._curFillForm={
      _action:d,
      _backFun:_backFun,
      _curData:{},
      _result:{_type:r._warning,_msg:_bzMessage._action._noData},
      _failedResults:[],
      _success:[],
      _missingData:{},
      _filledData:{},
      _curActionList:[],
      _successItems:[]
    }
    if(d.data.constructor==Array){
      _ergodicSettingHandler._buildFillformData(d)
    }

    o._exeProcess=function(){
      _ideReport._outputActionLog(d,60000)
      _timingInfo._setInfo([_bzMessage._task._analysising])
      o._keyMap={}
      for(let k in d.data){
        o._keyMap[k]=1
      }
      
      BZ._setTimeout(function(){
        o._fillActionList()
      },100);
    }
    
    o._fillActionList=function(_full){
      o._submitError=0
      var ks=Object.keys(d.data)

      ks.forEach(k=>{
        o._newActionListItem(k,_full)
      })
      if(o._curActionList.length){
        if(!o._submitError&&o._needRefill&&!_full){
          return o._fillActionList(1)
        }
        o._exeCurAction()
      }else{
        o._end()
      }
    }
    
    o._newActionListItem=function(k,_full){
      var dk=d.data[k]
      var a={
        element:dk.element||d.element,
        $lable:dk.$label,
        customize:dk.customize,
        $header:dk.$header,
        qpath:dk.element,
        event:{autoBlur:1,type:"change",_dataSrc:dk,_valueKey:k},
        type:1
      }
      if(o._setNewActionValue(a,o._filledData,_full)){
        if(a.event._curValueType=="error"){
          o._submitError=a
        }
        
        o._curActionList.push({a:a,k:k,v:dk,p:k})
      }
    }

    //a: action, _filledData: filled data,_full: fill all data
    o._setNewActionValue=function(a,_filledData,_full){
      a=a.event
      let k=a._valueKey
      let vm=a._dataSrc,vv=_filledData[k];
      a._curValueType=""
      a._curValidMsg=""
      if(vm.constructor==Object){
        if(vm.error&&vm.error.constructor==Array&&!vm.error.length){
          delete vm.error
        }
        if(!_full&&vm.error!==undefined&&!o._submitError){
          if(vm.error.constructor==Array){
            vv=vm.error.shift()
            if(!vm.error.length){
              delete vm.error
            }
          }else {
            vv=vm.error
            delete vm.error
          }
          a._curValidMsg=vv.message
          vv=vv.value!==undefined?vv.value:vv
          a._curValueType="error"
        }else{
          if(!_full&&(((vm.success.value!==undefined)&&vv==vm.success.value)||vv==vm.success)){
            return
          }else{
            vv=vm.success.value!==undefined?vm.success.value:vm.success
            a._curValidMsg=vm.success.message
          }
        }
        a.value=vv
      }else{
        if(vv==vm&&!_full){
          return
        }else{
          a.value=vm
        }
      }
      o._curData[k]=a.value
      if(!_full){
        _filledData[k]=a.value
      }
      return a
    }
    
    o._exeCurAction=function(){
      if(!_TWHandler._isAfterRequest()){
        return o._exeCurAction()
      }
      _ideReport._outputActionLog(d,1000)
      if(!BZ._isPlaying()){
        o._end()
        return
      }
      var a=o._curExeItem=o._curActionList.shift();
      if(a){
        _timingInfo._setInfo([_bzMessage._task._fillingForm+": "+a.k])
        
        BZ._setTimeout(function(){
          /*****************************************************/
          //after trigger action, call back o._exeItemResult
          /*****************************************************/
          a.a._inForm=1
          _ideTask._action._runAction(a.a)
        },100)
      }else if(o._afterFillAll){
        o._afterFillAll()
      }else{
        BZ._setTimeout(function(){
          //success
          if(d.autoNext){
            o._submit("nextBtn")
          }else if(d.autoSubmit){
            o._submit("submitBtn")
          }else{
            o._deepTest()
          }
        },100)
      }
    }
    
    o._deepTest=function(_setFailedOnEnd){
      if(o._submitError){
        //rebuild data
        o._fillActionList()
      }else{
        if(_setFailedOnEnd){
          o._addFailedResult({
            _msg:_bzMessage._action._failedOnSuccessData
          })
        }else if(Object.keys(o._missingData).length){//After click next on success data
          d.data=o._missingData
          o._missingData={}
          o._success=[]
          o._fillActionList()
          return
        }
        o._end()
      }
    }
    //_data: action
    //_checkType: line or submit
    o._checkMsg=function(_data,_checkType,_fun){
      if(!_checkType){
        return _fun()
      }
      let _css=_cssHandler._getActionMsgCss(d,_checkType)

      let _setting={
        _checkType:_checkType,
        element:d.element,
        _data:[]
      }
      let _lineErrCss=_Util._isEmpty(d.lineError||[])?"":d.lineError
      let _sumErrCss=_Util._isEmpty(d.finalError||[])?"":d.finalError

      for(let i=0;i<_data.length;i++){
        let a=_data[i].a;
        var _curValueType=a.event._curValueType;
        if(a.event._curValidMsg||_curValueType=="error"||_css[_curValueType]){
          _setting._data.push({
            _element:a.element,
            qpath:a.qpath,
            _type:_curValueType,
            _valueKey:a.event._valueKey,
            _lineErrCss:_lineErrCss,
            _sumErrCss:_sumErrCss,
            _msg:a.event._curValidMsg,
            _value:a.event.value
          })
        }else if(!_curValueType&&d.finalError){
          _setting._data.push({
            _element:a.element,
            qpath:a.qpath,
            _type:"",
            _valueKey:a.event._valueKey,
            _lineErrCss:_lineErrCss,
            _value:a.event.value
          })
        }
      }
      
      if(_setting._data.length){
        BZ._setTimeout(function(){
          _cssHandler._checkFillFormMsg(_setting,function(ds){
            //TODO: store check result
            for(var k in ds){
              var dd=ds[k]
              if(!dd._result){
                let _msg;
                if(dd._type=="error"){
                  _msg=_bzMessage._action._lostTargetElement
                }else{
                  _msg=_Util._formatMessage(
                    _bzMessage._action._msgNotMatch,
                    [
                      dd._valueKey,
                      dd._value,
                      dd._msg,
                      dd._updateMsg
                    ]
                  )
                }
                o._addFailedResult({
                  _msg:_msg,
                  _valueKey:dd._valueKey,
                  _value:dd._value,
                  _defMsg:dd._msg,
                  _updateMsg:dd._updateMsg
                })
                if(!dd._updateMsg){
                  o._needRefill=1
                }
              }
            }
            _fun()
          })
        },500)
      /*
      }else if(d.finalSuccess){
        _cssHandler._isElementReady({ts:[_btnPath],element:d.element},function(b){
          if(!b){
            o._addFailedResult({
              
            })
          }
          _fun()
        })
        */
      }else{
        _fun()
      }
    }
    
    o._addFailedResult=function(_msg){
      for(var i=0;i<o._failedResults.length;i++){
        if(o._failedResults[i]._msg==_msg._msg){
          return
        }
      }
      o._failedResults.push(_msg)
    }
    
    o._submit=function(_btnType){
      if(!_TWHandler._isAfterRequest()){
        return BZ._setTimeout(function(){
          o._submit(_btnType)
        },100)
      }
      var _btnPath=d[_btnType]
      _cssHandler._isElementReady({ts:[_btnPath],element:d.element},function(b){
        b=b[0]
        if(b=="enable"){
          var a={_inForm:1,element:_btnPath,type:1,event: {type: "mouse","button": 1,action: "click"}}
          
          _ideTask._action._runAction(a,0,function(){
            BZ._setTimeout(function(){
              o._checkAfterSubmit(_btnType)
            },1000)
          })
        }else if(b=="disable"){
          o._deepTest(1)
        }else if(_btnType=="nextBtn"&&d.autoSubmit){
          o._submit("submitBtn")
        }else{
          o._deepTest(1)
        }
      })
    }
    
    o._checkAfterSubmit=function(_btnType){
      if(!_TWHandler._isAfterRequest()){
        return BZ._setTimeout(function(){
          o._checkAfterSubmit()
        },100)
      }
      if(d.handleMsg&2){
        //check on all data
        return o._checkMsg(o._success,d.handleMsg,function(_failedResult){
          _cssHandler._isElementReady({ts:o._success.map(oo=>{return oo.a.element}),element:d.element},function(rs){
            var _enableCount=0,_emptyCount=0
            rs.forEach(rr=>{
              if(rr.includes("enable")){
                _enableCount++
              }
              if(rr.includes("empty")){
                _emptyCount++
              }
            })
            
            if(rs.length-_enableCount>rs.length/2){//form is submitted and dispear
              if(o._submitError){//It is a error on submit error data
                o._result._type=r._error;
                o._addFailedResult({
                  _msg:_bzMessage._action._passErrData+":\n",
                  _valueKey:o._submitError.k,
                  _value:o._curData[o._submitError.k]
                })
                $test.curFillFormData=_Util._clone(o._curData)
                o._end()
              }else{//It is right for submit a normal data
                if(_btnType=="nextBtn"){
                  if(!Object.keys(o._missingData).length&&d.autoSubmit){
                    return o._submit("submitBtn")
                  }
                  d.data=o._missingData
                  o._missingData={}
                  o,_deepTest()
                }else{
                  o._checkSuccessInfo(function(_success){
                    o._success=[]
                    o._filledData={}
                    if(d.finalSuccess&&!_success){
                      o._result._type=r._failed
                      o._addFailedResult({
                        _msg:_bzMessage._action._missSuccessMsg
                      })
                    }
                    _cssHandler._cleanCache(d,function(){
                      o._end()
                    })
                  })
                }
              }
            }else{//form is still here
              if(o._submitError){// It is right for submit error data
                o._deepTest()
              }else{//It is maybe not good for normal data
                o._checkSuccessInfo(function(_success){
                  if(!_success){
                    o._result._type=r._error;
                    o._addFailedResult({
                      _msg:_bzMessage._action._failedOnSuccessData
                        +(d.finalSuccess?" "+_bzMessage._common._orWord+" "+_Util._formatMessage(_bzMessage._action._missSuccessMsg,d.finalSuccess):"")
                    })
                  }
                  _cssHandler._cleanCache(d,function(){
                    o._end()
                  })
                })
              }
            }
          })
        })
      }
      o._deepTest()
    }
    
    o._checkSuccessInfo=function(_fun){
      if(d.finalSuccess){
        _cssHandler._isElementReady({ts:[d.finalSuccess],element:d.element},function(rs){
          _fun(rs[0])
        })
      }else{
        _cssHandler._chkNoElement({
          element:d.element,
          _css:d.finalError||d.lineError
        },function(r){
          _fun(!r)
        })
      }
    }

    o._exeItemResult=function(_result,dd){
      _timingInfo._end();
      if(dd.$newElement){
        o._curExeItem.a.qpath=dd.$newElement
      }
      if(_result._type==r._success){
        let _found=0
        for(var i=0;i<o._success.length;i++){
          if(o._success[i].k==o._curExeItem.k){
            o._success[i]=o._curExeItem
            _found=1
            break
          }
        }
        if(!_found){
          o._success.push(o._curExeItem)
        }
        if(d.handleMsg&1){
          //check on each line
          return o._checkMsg([o._curExeItem],1,function(){
            o._exeCurAction()
          })
        }
        o._exeCurAction()
      }else if(_result._type==r._error){
        o._missingData[o._curExeItem.k]=o._curExeItem.v
        delete d.data[o._curExeItem.k]
        o._exeCurAction()
      }else if(_result._type==r._failed){
        if(o._curExeItem.a.event._curValueType!="error"){
          o._addFailedResult({
            _msg:o._curExeItem.k+": "+_result._msg,
            _valueKey:o._curExeItem.k,
            _value:o._curData[o._curExeItem.k]
          })
          o._end()
        }
      }
    }
    o._end=function(){
      o._success=[]
      o._filledData={}
      _timingInfo._end()
      _domActionTask._curFillForm=0
      $test.curFillFormData=_Util._clone(o._curData)
      o._result._msg=""
      var _successList=new Set(Object.keys(d.data))
      if(!o._failedResults.length&&o._result._type==r._warning){
        if(Object.keys(o._missingData).length){
          o._result._type=r._failed;
        }else{
          o._result._type=r._success;
        }
      }else{
        if(o._result._type==r._warning){
          o._result._type=r._failed
        }
        o._failedResults.forEach((f,j)=>{
          if(f._data&&f._data._valueKey){
            o._result._msg+="\n"+(j+1)+". "+f._data._valueKey+": "
            _successList.delete(f._data._valueKey)
          }else{
            o._result._msg+="\n"+(j+1)+". "
          }
          o._result._msg+=f._msg
        })
      }
      if(!o._failedResults.length){
        if(o._result._msg){
          o._result._msg+="\n---------------------\n"
        }
        _successList=[..._successList]
        o._result._msg+="\n"+_successList.map(oo=>{return oo+":"+_bzMessage._common._success}).join("\n")
      }
      _ideReport._ignoreReport=0
      o._result._data=o._action;
      o._result._fillFomeData={
        _failedResults:o._failedResults,
        _successList:_successList
      }
      _ideTask._setDoNext(o._result);
    }
    if(d.data&&!$.isEmptyObject(d.data)){
      o._exeProcess()
    }else{
      if(d.autoSubmit){
        o._submit("submitBtn")
      }else{
        o._result._data=d
        return _backFun?_backFun(o._result):_ideTask._setDoNext(o._result);
      }
    }
  },
  _logOneAction:function(a){
    let v=a._path.match(_IDE._actionPathRegex)
    if(v){
      v="##"+_bzMessage._log._exeSingleActionGroup+"## ("+v[0].split("/").pop()+"), "+a.description
      _domActionTask._doLog(v)
    }
  },
  _reportAppInfo:function(v){
    if(bzTwComm._isExtension()){
      bzTwComm._postToIDE({
        _fun:"_receiveAPPInfo",
        _scope:"_ideTask",
        _args:[v]
      })
    }
  },
  _doLog:function(v){
    if(bzTwComm._isExtension()){
      bzTwComm._postToIDE({
        _fun:"log",
        _scope:"console",
        _args:["BZ-LOG: "+v]
      })
    }else{
      console.log(v+" (APP)")
    }
  },
  _exeOneActionList:function(_data,_setting,_backFun,_descDelay){
    _data.asOneAction=0
    let as=[_data],_result,_lastLog,_waitSameRequest=0,_startTime=Date.now(),_tryNotWait;
    _domActionTask._curOneActionList=as.concat(_data._oneActionList)
    let ss=[],_curGroup,_retry=0,_speed=parseInt(_data.speed)||50,_enableElse,_lastAction;
    let _localActions=localStorage.getItem(_data._path)
    localStorage.removeItem(_data._path)
    _domActionTask._curOneActionList.forEach(x=>x._inOneAction=1)
    if(_localActions){
      let _leaveActions=_Util._strToJson(_localActions)
      if(!_Util._isEmpty(_leaveActions)){
        _domActionTask._curOneActionList=_leaveActions
      }
    }
    $group=null
    _doIt()
    
    function _doIt(a){
      let _ssss=(a&&(a.max||a.min))||_speed
      BZ._setTimeout(()=>{
        if(_TWHandler._curRequestList.length&&!_tryNotWait){
          _waitSameRequest++
          let _log=_Util._formatMessage(
            _bzMessage._task._waitRequests,[
              _TWHandler._curRequestList.length,
              _TWHandler._curRequestList.map(r=>{
                return "    "+r._url
              }).join("\n")+"\n"
            ]
          )
          if(_lastLog!=_log){
            _lastLog=_log
            _domActionTask._doLog(_log)
            _retry=0
            return _doIt(a)
          }else{
            _log=_bzMessage._task._logAgain
            if(_waitSameRequest<10&&Date.now()-_startTime<30000){
              _domActionTask._doLog(_log)
              _tryNotWait=1
              return _doIt(a)
            }
          }
        }
        if(!_tryNotWait){
          _lastLog=""
        }
        a=a||_domActionTask._curOneActionList.shift()
        _storeTmpData(_data._path,_domActionTask._curOneActionList)
        
        if(!a||a.type==7){
          if(_curGroup){
            if(_curGroup.loopGroup||!_chkEndGroup()){
              a&&_domActionTask._curOneActionList.unshift(a)
              _domActionTask._curOneActionList=ss.concat(_domActionTask._curOneActionList)
              ss=[]
              return _doIt()
            }else{
              _handleResult(_result,_curGroup)
              _curGroup=0
              ss=[]
              if(a){
                return _doIt(a)
              }
            }
          }else if(a){
            if(a.elseGroup&&!_enableElse){
              while(_domActionTask._curOneActionList.length){
                a=_domActionTask._curOneActionList.shift()
                if(a&&(!a.inGroup||a.type==7)){
                  _domActionTask._curOneActionList.unshift(a)
                  break
                }
              }
              return _doIt()
            }

            _enableElse=0
            _curGroup=a
            //Handle group data
            a&&_tmpLoopDatahandler._handleGroupData(a,_setting)
            return _doIt()
          }else if(_result){
            return _backFun(_result)
          }
        }else if(_curGroup){
          if(!ss.includes(a)){
            ss.push(a)
          }
          delete a.e
        }
        
        if(a){
          _TWHandler._curRequestList.length=0
          if(a!=_lastAction){
            _domActionTask._logOneAction(a);
            _lastAction=a
          }
          _domActionTask._exeAction(a,_setting,function(r){
            //Retry
            if((r._type==1&&a.failedReaction!=1)||(r._type==2&&a.failedReaction==2)){
              if(a.e&&a.type==1&&a.event.type=="change"&&!_Util._isInputObj(a.e,1)){
              }else{
                let _time=parseInt(a.max||_IDE._data._setting.advanced[a._supData.hostId||0].expectReactionTime||2000)
                if(_retry<_time){
                  _retry+=_speed
                  if(r._type==1){
                    _domActionTask._doLog(_bzMessage._task._retryOnMissingElement)
                  }else{
                    _domActionTask._doLog(_bzMessage._task._retryOnElementExist)
                  }
                  _tryNotWait=0
                  delete a.e
                  return _doIt(a)
                }
              }
            }
            delete a.e
            let v=_handleResult(r,a)
            if(v.includes("..")||v.includes("....")||(v.includes("...")&&a.inGroup)){
              if(ss.length==1&&a.type==0&&v.includes("...")){
                _enableElse=1
              }
              while(_domActionTask._curOneActionList.length){
                a=_domActionTask._curOneActionList.shift()
                if(a&&(!a.inGroup||a.type==7)){
                  _domActionTask._curOneActionList.unshift(a)
                  break
                }
              }
              if(_final(v,r)){
                return
              }
            }else{
              _retry=0
            }
            if(_domActionTask._curOneActionList.length||(_curGroup&&(_curGroup.loopGroup||window.$group!=null))){
              return _doIt()
            }else{
              return _final()
            }

            return _final()
          },_descDelay)
        }else if(_result){
          return _backFun(_result)
        }
      },_ssss)
    }
    
    function _storeTmpData(p,_list){
      try{
        _list=_list.map(x=>{
          x=Object.assign({},x)
          x._supData={
            actions:[],
            _path:x._supData._path,
            code:"t6",
            _supData:{
              code:x._supData._supData.code
            }
          }
          return x;
        })
        _list=JSON.stringify(_list)

        localStorage.setItem(p,_list)
      }catch(e){
        
      }
    }
    function _handleResult(r,a){
      r._data=a
      if(a.type==0){
        if(!a.content){
        }else if(a.content.type=="exist"){
          if(r._type==1){
            r._type=2
          }
        }else if(a.content.type=="unexist"){
          // if(r._type==1){
            // r._type=4
          // }else if(r._type==4){
            // r._type=2
          // }
        }
      }
      
      if(!r.exeTime){
        r.exeTime=a.exeTime
      }
      if(a.resultscript){
        _domActionTask._exeResultScript({
          failedAction:r._type<=2?a:0,
          status:r._type==2?"failed":r._type<2?"error":"success"
        },r)
      }

      let v=(r._type<=1?a.refOfError||"..":r._type==2?a.refOfFailed||"..":a.refOfSuccess||".").replace(/[\/]$/,"").split("/")
      if(v.includes("s")){
        r._type=4
      }else if(v.includes("w")){
        r._type=3
      }else if(v.includes("f")){
        r._type=2
      }else if(v.includes("e")){
        r._type=1
      }
      if(!_result){
        _result=_Util._clone(r)
        _result._resultList=[]
      }else if(_result._type>r._type){
        _result._type=r._type
      }
      if(r!=_result){
        _result._resultList.push(r)
        if(!_result._failedAction&&r._type<=2){
          _result._failedAction=a
        }
      }
      
      return v
    }

    function _chkEndGroup(){
      var ga=_curGroup
      window._tmpGroupLoopData=window._tmpGroupLoopData||{}
      let k=_tmpLoopDatahandler._getActionKey(ga)
      if(_tmpGroupLoopData[k]){
        if(_tmpGroupLoopData[k]&&_tmpGroupLoopData[k].d){
          if(_tmpGroupLoopData[k].d.constructor==Number){
            $group=_tmpGroupLoopData[k].i++
            if($group>=_tmpGroupLoopData[k].d){
              _tmpGroupLoopData[k]=$group=undefined
              return 1
            }
          }else{
            $group=_tmpGroupLoopData[k].d[_tmpGroupLoopData[k].i++]
            if(!$group){
              _tmpGroupLoopData[k]=$group=undefined
              return 1
            }
          }
        }
      }else{
        return 1
      }
    }

    function _final(_inError,r){
      if(_inError){
        _result._msg=r._msg
      }
      if(!_curGroup){
        if(_inError){
          _doScreenshot(r)
        }else{
          _backFun(_result)
        }
        return 1
      }

      let v=_handleResult(_result,_curGroup)
      if(_inError){
        if(_inError.includes("..")&&_curGroup._tmp){
          if(_result._type>=3){
            _curGroup.refOfSuccess="../"
          }else if(_result._type==2){
            _curGroup.refOfFailed="../"
          }else{
            _curGroup.refOfError="../"
          }
        }
        if(!v.includes("s")&&!v.includes("w")&&_result._type<3){
          if(BZ.TW&&!BZ.TW.closed&&!r._data.apiReplaceEvent&&r._data.element){
            _doScreenshot(r,v,_inError)
            return 1
          }
          _backFun(_result)
          return 1
        }else{
          delete _result._failedAction
          delete _result._msg
          
          if(!_domActionTask._curOneActionList.length||(!v.includes(".")&&!_inError.includes("..."))){
            _backFun(_result)
            return 1
          }
        }
      }else {
        _backFun(_result)
        return 1
      }
      _curGroup=0
      $group=null
      ss=[]
    }
    
    function _doScreenshot(r,v,_inError){
      setTimeout(()=>{
        _screenshotHandler._generate(r,0,function(c){
          _result._imgData={
            file:c,
            name:r._data._path.replace(/[\/]/g,".").replace(/[\.]$/,"")
          };
  
          // console.log("BZ-LOG: debugger screenshot: "+_result._imgData.name)
          _result._stack=r._data._idx
          if(!v||(!v.includes(".")&&!v.includes("...")&&!_inError.includes("..."))){
            return _backFun(_result)
          }
          
          _curGroup=0
          $group=null
          ss=[]
          _result=r
  
          _doIt()
        })
      },1000)
    }
  },
  _isLoading:function(_fun){
    let s=_IDE._data._setting.content.loadingElement
    if(s){
      if(_Util._isFunction(s)){
        try{
          s=_eval._exeCode(s)

          if(s&&_eval._isFun(s)){
            return _end(_eval._exeFun(s))
          }

          return _end(s)
        }catch(e){
          alert(e.message)
          return
        }
      }else{
        s=$util.findDom(s)
        if(s&&!_Util._isHidden(s)){
          return _end(1)
        }
      }
    }
    s=$util.findDom(":bz($loading)")
    if(s&&!_Util._isHidden(s)){
      return _end(1)
    }
    return _end()
    function _end(r){
      if(r){
        if(_fun){
          setTimeout(()=>{
            _domActionTask._isLoading(_fun)
          },100)
        }
        return r
      }
      _fun&&_fun()
    }
  },
  _exeAction:function(_data,_setting,_backFun,_descDelay){
    console.log("get action: "+bzTwComm.frameId)
    
    _domActionTask._doLog("Exe Action ...")
    _domActionTask._reportAppInfo("Exe action "+_data.description)
    if(_domActionTask._isLoading()){
      console.log("Page in Loading ...")
      return setTimeout(()=>{
        _domActionTask._exeAction(_data,_setting,_backFun,_descDelay)
      },100)
    }
    if(_domActionTask._lastAction&&_domActionTask._lastAction!=_data&&_data._repeatOnExtensionComm){
      if(_domActionTask._lastAction._path==_data._path){
        return
      }
    }
    _data._repeatOnExtensionComm=0
    _domActionTask._lastAction=_data
    if(_data.asOneAction&&_data._oneActionList){
      return _domActionTask._exeOneActionList(_data,_setting,function(_result){
        localStorage.removeItem(_data._path)
        _result.$returnValue=window.$returnValue
        _result.exeTime=_data.exeTime
        delete window.$returnValue

        var d={$newElement:window.$newElement};
        //d["_tmpTaskDataMap"]=_ideDataManagement._tmpTaskDataMap
        d._tmpTaskDataMap=_ideDataManagement._tmpTaskDataMap

        _backFun(_result,d)
      },_descDelay)
    }
    var _fun,_orgData=_data._timestamp?_data:_data._orgData==_data||(_data._supData&&_data._orgData&&_data._supData==_data._orgData._supData)?_data._orgData:_Util._clone(_data),_result={};
    _TWHandler._setPlayMode(BZ._data._uiSwitch._testPlay._curMode)
    _TWHandler._takeoverWin(0,_data);
    if(!_data.apiReplaceEvent&&!_TWHandler._isTakeoverReady()&&BZ.TW&&!BZ.TW.closed){
      if(!_data._waitAjax){
        _data._waitAjax=Date.now()
      }
      if(Date.now()-_data._waitAjax<1000){
        return BZ._setTimeout(function(){
          _domActionTask._exeAction(_data,_setting,_backFun,_descDelay)
        },1)
      }
    }
    
    if(_backFun){
      _fun=function(r){
        _domActionTask._doLog("Send back result")
        r.exeTime=_data.exeTime
        if(_data.e){
          delete _data.e.bzTxtElement
        }
        r._img=_data._img
        if(bzTwComm._isExtension()){
          r._url=BZ.TW.location.href
        }
        if(_data.type!=4&&_tmpLoopDatahandler._handleActionLoopData(_data,r)){
          return setTimeout(()=>{
            _domActionTask._exeAction(_orgData,_setting,_backFun,_descDelay)
          },(BZ._getCurTest()&&BZ._getCurTest()._data.speed)||_orgData.min||50)
        }

        BZ._lastResult=r;
        r._errorPos=_domActionTask._errorPos;
        /**/
        //TODO: The code is for upgrade data
        if(_setting._updateWizard){
          r._newElement=_data._orgData.element;
          //r._newExpection=_data._orgData.expection;
          //r._newMd5=_data._orgData._newMd5;
        }
        /**/
        _ideDataManagement._tmpTaskDataMap._group=$group
        r.$returnValue=window.$returnValue
        _fun=0
        if(bzTwComm._isExtension()){
          r._newScriptList=$script.newList
          $script.newList=[]
        }
        if(_backFun){
          let _finalFun=_backFun
          _backFun=0
          r._data=_data
          if(_data._takeScreenshot&&r._type<3){
            delete _data.e
            _data.element=["BZ.TW.document"]
            _domActionTask._doLog("Go to take screenshot")
            return _screenshotHandler._generate(r,0,function(v){
              r._canvas=v
              delete r._data.e
              _domActionTask._doLog("Send result 3")
              _finalFun&&_finalFun(r);
              _finalFun=0
            })
          }
          delete r._data.e
          _domActionTask._doLog("Send result 2")

          var d={$newElement:window.$newElement};
          //d["_tmpTaskDataMap"]=_ideDataManagement._tmpTaskDataMap
          d._tmpTaskDataMap=_ideDataManagement._tmpTaskDataMap

          _finalFun&&_finalFun(r,d);
          _finalFun=0
        }
      }
    }
    //Handle $group and $action 
    $group=_setting.$group;
    if(!BZ._isAutoRunning()&&_data._applyTmpData){
      _data._applyTmpData()
      $parameter=_aiAPI._preHandleParameter($parameter,0,_data._supData?_data._supData._supData:0)
    }
    if(_doApiRegister()){
      return
    }
    if((_data.type!=7||_data.asOneAction)&&!_tmpLoopDatahandler._initActionData(_data,_fun)){
      return
    }
    if(_doApiRegister()){
      return
    }

    if(_cssHandler._hasWaitingElement()){
      return BZ._setTimeout(function(){
        _domActionTask._exeAction(_data,_setting,_backFun,_descDelay)
      },100)
    }
    if(_data._code&&!_descDelay){
      return BZ._setTimeout(function(){
        _domActionTask._exeAction(_data,_setting,_backFun,1)
      },100)
    }
    var _force=_setting._force;
    _TWHandler._setPlayMode(_data._playMode)
    
    try{
      _tipHandler._removeAll();
      if(!_data._orgData){
        var a=_Util._clone(_data);
        a._orgData=_data;
        _data=a;
      }
      _domActionTask.TW=_setting.TW;
      //for cross-domain extension
      if(bzTwComm._isExtension()){
        _domActionTask.TW=window;
        BZ._prepareDocument();
      }
      window.$newElement=0
      
      _domActionTask._reportAppInfo("Prepare action: "+_data.description)
      if(!_domActionTask._prepareItem(_setting,_data,_result,_fun)){
        if(BZ._isAutoRunning()&&!_data._takeScreenshot){
          _screenshotHandler._getScreenshotInMd5(function(v){
            _Util._log("miss-element-screenshot-md5: "+v)
          })
        }
        // if(document.body._lastAction!=_data){
        //   _Util._log("Auto-retry on missing element of: "+_data.description)
        //   return setTimeout(()=>{
        //     document.body._lastAction=_data
        //     _domActionTask._exeAction(_data,_setting,_backFun,_descDelay)
        //   },1000)
        // }
        _domActionTask._reportAppInfo("Prepare action failed on: "+_data.description)
        if(_result._type==_taskInfo._type._notReady&&(!_domActionTask._notReadyTime||Date.now()-_domActionTask._notReadyTime<2000)){
          _domActionTask._notReadyTime=_domActionTask._notReadyTime||Date.now()
          return BZ._setTimeout(function(){
            _domActionTask._exeAction(_orgData,_setting,_backFun,_descDelay)
          },100)
        }
        _domActionTask._notReadyTime=0
        return //_fun&&_fun(_result)
      }else if(_data.type==1&&_data.e&&!_data.apiReplaceEvent&&_data.event&&_data.event.action=="click"){
        _domActionTask._reportAppInfo("clicked: "+_data.e.outerHTML.substring(0,300))
      }
      if(_data.e&&_data.type==0){
        _bzDomPicker._flashTmpCover(_data.e)
      }
      _domActionTask._reportAppInfo("After Prepare action: "+_data.e)

      _domActionTask._notReadyTime=0
      _result._data=_data;

      _waitData(function(){
        if(_apiHandler._isRequestAction(_data)){
          _result._type=4
          _result._msg=""
          _data.requests.forEach(r=>{
            _ideDataManagement._initRandomValue(r.body)
            _ideDataManagement._initRandomValue(r.headers)
          })
          if(_data.rampUp){
            $parameter.$result=[]
            return _domActionTask._exeRampUp(_data,function(r){
              _fun&&_fun(r)
            },1)
          }else if(_data.repeatTimes){
            $parameter.$result=[]
            return _domActionTask._exeLoad(_data,function(r){
              _fun(r)
            },0)
          }else{
            return _domActionTask._exeAPI(_data.requests,0,0,function(r){
              _fun(r)
            },_result)
          }
        }else if (!_force) {
          _waitOverWin()
        }else{
          _doIt(0)
        }
      })
    }catch(ex){
      BZ._log(ex.stack)
      if(_fun){
        _result._type=bzTwComm._isExtension()?_taskInfo._type._error:_taskInfo._type._crash;
        _result._msg=ex.message;
        _fun(_result)
      }
    }

    function _waitData(_fun){
      let d=[$parameter,$test,$module,$project,window.$action,window.$group]
      _chkData()
      function _chkData(){
        if(_hasWaitData(d)){
          return setTimeout(()=>{
            _chkData()
          },100)
        }
        _fun()
      }
    }

    function _hasWaitData(d,_fun){
      let _has;
      if(d&&_Util._isObjOrArray(d)){
        for(let k in d){
          let v=d[k]
          if(v&&v.constructor==Promise){
            if(!v._has){
              v.then(x=>{
                d[k]=x
                _hasWaitData(d,_fun)
              })
            }
            _has=1
          }else if(_Util._isObjOrArray(v)){
            _has=_has||_hasWaitData(v)
          }
        }
      }
      return _has
    }
    function _doApiRegister(){
      if(bzTwComm._isIDE()){
        if(!_aiAuthHandler._isAuthItem(BZ._getCurModule())){
          return (!_data.apiReplaceEvent||_apiDataHandler._hasWaitingData([window.$parameter,window.$group,window.$action]))&&_apiDataHandler._registerExeFun(()=>{
            _domActionTask._exeAction(_data,_setting,_backFun,_descDelay)
          },0,1,_data)
        }
      }
    }
    function _waitOverWin(){
      if(bzTwComm._isExtension()){
        BZ._setTimeout(function(){
          var w=window.$TW||window;
          if($(w.document).find("#bzOverrideMark").length){
            _doIt(0)
          }else{
            _TWHandler._takeoverWin(0,_data)
            _waitOverWin()
          }
        },10)
      }else{
        _doIt(0)
      }
    }
    
    function _doIt(_tryTime,_noCamera){
      if(_data.e&&BZ._hasVideo&&!_noCamera&&BZ.TW==window){
        return _domActionTask._takeScreenshot(_data,function(v){
          if(v&&v.length>100){
            _Util._log("video-img: "+v)
          }
          _doIt(_tryTime,1)
        })
      }else if(_data.e&&BZ._data._uiSwitch._testPlay._curMode=="_camera"&&!_noCamera&&!_data.cameraMd5&&!_data._camera&&!_data._inVisit&&!_data._inForm){
        if(_data.e){
          return _domActionTask._takeScreenshot(_data,function(){
            _doIt(_tryTime,1)
          })
        }
      }

      _domActionTask._taskQueue=_setting._taskQueue;
      
      var T=_ideActionData._type;
      var M=_ideActionData._method;
      try{
        //Ref
        if(_data.type==T._ref||_data.refCom){
          _result._type=_taskInfo._type._success;
          _result._goingCom=1
        //Validation
        }else if(_data.type==T._validation && _data.method==M._data){
          _result=_domActionTask._validateByData(_data,_setting,_force);
        //Extract data
        }else if(_data.type==T._extractData && _data.method==M._data){
          if(_data.api && _data.api.httpMethod=="GET" && _data.api.downloadAsFile){
            return _domActionTask._fetchFileDataFromURL(_data.api.httpURL,function(v){
              _domActionTask._setErrorPos(_result,"_script","_actionDetailsGeneral");
              _domActionTask._exeScript(_data.script,v,window.$element,function(){
                _fun&&_fun({_type:_taskInfo._type._success})
              });
            })
          }else{
            _result=_domActionTask._extractDataByData(_data,_setting);
            _domActionTask._setErrorPos(_result,"_script","_actionDetailsGeneral");
            _domActionTask._exeScript(_data.script,_result._extractData,window.$element,function(){
              if(!_result._extractData.data){
                _result._type=3
                _result._msg=_bzMessage._task._extractEmptyData
              }
            });
          }
        //Visit 
        }else if(_data.type==T._visit){
          _aiVisitHandler._start(_data)
          _result._type=_taskInfo._type._success;
          return BZ._setTimeout(function(){
            if(_fun){
              _fun(_result)
            }
          },100)
        //Group
        }else if(_data.type==T._group){
          _result._type=_taskInfo._type._success;
          if(!BZ._isAutoRunning()&&!bzTwComm._isExtension()){
            _ideActionGroup._switchGroupOpen(_data._orgData,true)
          }
          // if(_data.singleAction){
            // return _domActionTask._exeEventGroup(_data,_fun)
          // }
        //Script
        }else if(_data.type==T._script){
          _domActionTask._setErrorPos(_result,"_script","_actionDetailsGeneral");
          if(bzTwComm._isExtension()){
            _TWHandler._takeoverConsole(window)
          }
          return _domActionTask._doScript(_data,function(r){
            var _assertList=_TWHandler._takeAssertInfo();
            if(_assertList.length){
              r._type=_taskInfo._type._failed;
              
              r._msg=r._msg||"";
              _assertList.forEach(function(v){
                r._msg+=v+"\n"
              });
            }
            
            if(_fun){
              _fun(r)
            }
          });
        //validation Script
        }else if(_data.type==T._validation && _data.method==M._script&&_data.runInIDE){//script
          return _domActionTask._validateJs(_data,_fun);
        }else if(_data.type==T._refresh&&_data.refreshType){
          (_data.refreshData||[]).forEach(v=>{
            let mc=BZ._getCurModule()._data.code,
                tc=BZ._getCurTest()._data.code
            if(v.startsWith("$project")){
              $project=_ideDataManagement._tmpTaskDataMap._app[""]=$data(0,0,1)
            }else if(v.startsWith("$module")){
              $module=_ideDataManagement._tmpTaskDataMap._app[mc]=$data(mc,0,1)
            }else if(v.startsWith("$test")){
              $test=_ideDataManagement._tmpTaskDataMap._app[mc+tc]=$data(mc,tc,1)
            }
          })
        }else if(_data.type==T._refresh &&!_data.refreshType){
          let _url=_data.loadURL
          if(!_url){
            if(!BZ.TW||BZ.TW.closed){
              _url=_Util._mergeURL(_ideTestManagement._getCurHost(), _JSHandler._prepareData("/",0,2))
            }else{
              if(bzTwComm._isIDE()){
                _extensionComm._setCmd("location.reload()");
              }else{
                BZ.TW.location.reload()
              }
              _fun&&_fun({_type:_taskInfo._type._success})
              return
            }
          }
          return _TWHandler._openUrl(_url,function(_event){
            _event=_event||{}
            if(_event.error){
              if(_TWHandler._isIgnoreRequest(_event.url)){
                _event.error=0
              }else{
                if(_data!=_ideTask._setting._testingData){
                  return
                }
                if(_tryTime<3){
                  return BZ._setTimeout(function(){
                    _doIt(++_tryTime)
                  },3000)
                }
              }
            }
            BZ._twInError=_event.error?Number.MAX_SAFE_INTEGER:0
            var _txt=_event.error?_bzMessage._system._error._loadPageErr:_event.failed?_bzMessage._system._error._loadPageFailed:"";
            if(_txt){
              _txt=_Util._formatMessage(_txt,[_event.code||""])
              
              _txt+=_url
              BZ._log("BZ-LOG: exeAction:"+_txt)
            }else{
              _txt=_bzMessage._system._info._loadPageSuccess+_url
            }
            _ideTask._setDoNext({
              _type:_event.error?_taskInfo._type._crash:_event.failed?_taskInfo._type._failed:_taskInfo._type._success,
              _msg:_txt,
              _data:_data
            });
          });
        }else if(window.BZ && window.BZ._hasTestWindow()){
          //Refresh
          if(_data.type==T._refresh&&!_data.refreshType){
            _result._type=_taskInfo._type._success;
            _domActionTask.TW.document.body.innerHTML="";
            if(_data.clearLocalStorage){
              var _bzData=_domActionTask.TW.localStorage.getItem("bz-data");
              _domActionTask.TW.localStorage.clear();
              _domActionTask.TW.localStorage.setItem("bz-data",_bzData);
            }
            if(_data.clearCookie){
              $util.clearCookie(_domActionTask.TW.document);
            }
            if(_fun){
              _fun(_result);
            }
            _domActionTask.TW.location.reload();
            return
          //Validation html
          }else if(_data.type==T._validation && _data.method==M._html){
            if(_data.content.type=="screenshot"){
              return _domActionTask._validateScreenshot(_data,_force,_fun);
            }
            _result=_domActionTask._validateHtml(_data,_force);
          //validation Script
          }else if(_data.type==T._validation && _data.method==M._script){//script
            console.log("validation Script")
            return _domActionTask._validateJs(_data,_fun);
          //Extract data on html
          }else if(_data.type==T._extractData && _data.method==M._html){ //extract
            _result=_domActionTask._extractDataByHtml(_data);
            return _domActionTask._exeScript(_data.script,_result._extractData,window.$element,function(){
              _fun&&_fun(_result)
            });
          //event
          }else if(_data.type==T._triggerEvent){ //event
            var _change=null;
            if(_data.event.action=="dragdrop"){
              return _domActionTask._doDragdrop(_data,_fun)
            }else if(_data.event.action=="drag"){
              return _domActionTask._doDrag(_data,_fun)
            }
            return _domActionTask._trigger(_data,_fun);
          }else if (_data.type==T._comment) {
            _result=_domActionTask._doComment(_data);
          }
        //Refresh load page
        }else{
          _result._type=_taskInfo._type._crash;
          _result._errSou=_taskInfo._errSou._env;
          _result._msg=_bzMessage._system._error._missTestWindow;
        }
      }catch(e){
        console.error(e.stack)
        _result._type=_taskInfo._type._error;
        if(_data.element && !window.$element){
          _result._errSou=_taskInfo._errSou._element;
          _result._msg=_bzMessage._system._error._missElement;
        }else{
          _result._msg=(e.stack||"").toString().split("\n")[0];
        }
        if(e.stack.includes("_exeScript")){
          _result._errSou=_taskInfo._errSou._script;
        }
      }
      _result._errorPos=_domActionTask._errorPos;
      if(_fun){
        _fun(_result);
      }
    }
  },
  // _pickBatchRequestData:function(d){
  //   let ds=[],v,rs=[]
  //   let r=d.requests,qs,us
  //   r.forEach(x=>{
  //     ds.push(..._debugDataHandler._retrieveBindDataFromAction(x))
  //   })
    
  //   ds=[...new Set(ds)]
    
  //   if(d._supData&&d._supData.definition){
  //     qs=d._supData.definition.query
  //     us=d._supData.definition.path
  //   }
    

  //   ds.forEach(x=>{
  //     try{
  //       eval("v="+x)
  //       if(v&&v.constructor==Array){
  //         let k=x.split(".").pop()
  //         if(!qs&&!us.length){
  //           rs.push({k:x,v:v})
  //         }else{
  //           if(qs&&qs.find(y=>{
  //               if(y.name==k){
  //                 if(!y.inArray){
  //                   rs.push({k:x,v:v})
  //                 }
  //                 return 1
  //               }
  //             })){
              
  //           }else if(us&&us.find(y=>{
  //               if(y.name==k){
  //                 if(!y.inArray){
  //                   rs.push({k:x,v:v})
  //                 }
  //                 return 1
  //               }
  //           })){
              
  //           }
  //         }
  //       }
  //     }catch(ex){}
  //   })
  //   return rs
  // },
  _exeLoad:function(d,_fun,i){
    i=i||0
    let t=d.period/d.repeatTimes
    if(i>=parseInt(d.repeatTimes)){
      return
    }

    if(!d._result){
      d._result={_type:4,_details:{},_start:Date.now()}
    }

    d._result._details[i]={i:i,_start:Date.now(),_data:[]}

    _domActionTask._exeAPI(d.requests,d.exeMethod!=1,0,function(r){
      // d._result._details[i]._result=r
      // d._result._details[i]._end=Date.now()
      
      if(d._result._type>r._type){
        d._result._type=r._type
      }
      // if(r._msg){
        // d._result._msg=d._result._msg||""
        // d._result._msg+=r._msg
      // }
      for(var n=0;n<d.repeatTimes;n++){
        if(!d._result._details[n]||!d._result._details[n]._end){
          return
        }
      }
      
      d._result._end=Date.now()
      _fun(d._result)
    },{idx:i,_details:d._result._details,_inLoadingTest:1})
    BZ._setTimeout(function(){
      _domActionTask._exeLoad(d,_fun,i+1)
    },t)
  },
  _exeRampUp:function(d,_fun,n){
    if(!d._result){
      d._result={
        _type:4,
        _details:{},
        _start:Date.now(),
        _runningRequests:0,
        _idx:-1,
        _max:0
      }
      n=1
    }
    
    if(n){
      n--
      d._result._runningRequests++
      if(d._result._runningRequests>d._result._max){
        d._result._max=d._result._runningRequests
      }
      d._result._idx++
      let i=d._result._idx
      
      d._result._details[i]={i:i,_start:Date.now(),_data:[]}
      _domActionTask._exeAPI(d.requests,1,0,function(r){
        if(d._result._type>r._type){
          d._result._type=r._type
        }
        d._result._runningRequests--
        BZ._clearTimeout(_domActionTask._nextRampTime)
        _lanuchRequest(_fun)
      },{idx:i,_details:d._result._details,_inLoadingTest:1})
    }
    let t=(Date.now()-d._result._start)/1000

    if(t<parseInt(d.rampUp.totalTime)){
      if(n>0){
        return BZ._setTimeout(()=>{
          _domActionTask._exeRampUp(d,_fun,n)
        },0)
      }
      _domActionTask._nextRampTime=BZ._setTimeout(()=>{
        _lanuchRequest(_fun)
      },1000)
    }else{
      _waitFinish(_fun)
    }
    
    function _lanuchRequest(_fun){
      t=(Date.now()-d._result._start)/1000
      if(t<parseInt(d.rampUp.totalTime)){
        if(d.rampUp.up>0){
          t=parseInt((t/d.rampUp.up)*d.rampUp.users)
        }else{
          t=d.rampUp.users
        }
        if(t>d.rampUp.users){
          t=d.rampUp.users
        }
        t-=d._result._runningRequests
        
        if(t){
          return _domActionTask._exeRampUp(d,_fun,t)
        }else{
          _domActionTask._nextRampTime=BZ._setTimeout(()=>{
            _lanuchRequest(_fun)
          },1000)
        }
      }else{
        _waitFinish(_fun)
      }
    }
    function _waitFinish(_fun,vs){
      BZ._clearTimeout(_domActionTask._waitFinishTime)
      if(!vs){
        vs=[]
        for(var k in d._result._details){
          if(!d._result._details[k]._end){
            vs.push(d._result._details[k])
          }
        }
      }else{
        _Util._spliceAll(vs,x=>{
          return x._end
        })
      }
      if(!vs.length){
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++")
        console.log("BZ-LOG: max: "+d._result._max)
        console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++")
        d._result._end=Date.now()
        _fun(d._result)
      }else{
        _domActionTask._waitFinishTime= BZ._setTimeout(()=>{
          _waitFinish(_fun,vs)
        })
      }
    }
  },
  _handleResponseData:function(v,_outputData){
    let _msg
    if(v&&v.constructor==Object){
      _msg=v.message
      console.log("BZ-LOG: API status: "+v.status)
      for(var k in v){
        let vv=v[k]
        if(vv&&vv.constructor==String){
          try{
            // if(_outputData){
            //   console.log("BZ-LOG: "+k)
            // }
            vv=_Util._strToJson(vv)
            if(vv&&[Array,Object].includes(vv.constructor)){
              _msg=_msg||vv.message
              // for(var kk in vv){
              //   let vvv=JSON.stringify(vv[kk])
              //   vvv=vvv.substring(0,100)+(vvv.length>100?" ...":"")
              //   if(_outputData){
              //     console.log("BZ-LOG:     "+kk+": "+vvv)
              //   }
              // }
            }else{
              // vv=(vv+"").substring(0,100)+(vv.length>100?" ...":"")
            }
          }catch(e){
            // vv=(vv+"").substring(0,100)+(vv.length>100?" ...":"")
          }
        }else{
          // if(_outputData){
          //   console.log("BZ-LOG: "+k+": "+vv)
          // }
        }
      }
    }
    return _msg
  },
  _exeAPI:function(aa,_async,i,_fun,_result){
    var a=_Util._clone(aa[i]),_returnData,
        _timerout
    if(a){
      let _proxy=_IDE._data._setting.advanced[a.host||0].apiProxy
      if(a.disable){
        return _domActionTask._exeAPI(aa,_async,i+1,_fun,_result)
      }
      _result._apiParameter=a
      _domActionTask._prepareRequest(a,_result);
      a.cache=false;
      if(_async){
        a.async=_async;
      }
      if(_apiHandler._isSocketRequest(a)){
        return _domActionTask._exeSocket(a,_result,function(){
          _domActionTask._exeAPI(aa,_async,i+1,_fun,_result)
        })
      }
      if(_result._details===undefined){
        _result._msg=_result._msg||""
        if(_result.idx===undefined){
          _result._msg+="\n"+"url: "+a.url
        }else{
          _result._msg+="\n"+(_result.idx+1)+". url: "+a.url
        }
        _result._start=Date.now()
      }else{
        _result._details[_result.idx]._curStart=Date.now()
      }
      
      a.complete=function(v){
        if(!_timerout){
          return
        }
        clearTimeout(_timerout)
        $result=v
        //Log API Response:
        let _msg=_domActionTask._handleResponseData(v,!_result._inLoadingTest)

        let _curDetails,_end=Date.now();

        v.idx=_result.idx;
        var r={_type:_Util._isAPISucessStatus(v.status)?4:1};

        
        _result._responseScriptResultData=_domActionTask._exeResponseScript(a,r,v)||0

        _result._type=r._type
        if(r._returnData){
          _result._returnData=_result._returnData||[]
          r._returnData._idx=a._idx
          r._returnData.actionResult=r._type
          _result._returnData[a._idx]=r._returnData
        }        

        if(_result._type>2&&[Object,Array].includes(_result._responseScriptResultData.constructor)&&!(a.responseScript&&a.responseScript.match(/\$aiAPI[.](add|updata|delete)Data/))){
          if(a.method=="DELETE"&&a.asStdFun){
            _aiAPI._deleteData($parameter,a._module)
          }else if(a.asStdFun){
            _aiAPI._updateData(_result._responseScriptResultData,a._module)
          }
        }
        
        let s=v.responseText||_msg||""
        
        if(!s&&v.data&&v.data.constructor==String){
          s=v.data
        }

        if(_result._details===undefined){
          
          _result._msg+="\n"+_bzMessage._common._status+": "+v.status+"\n"+_bzMessage._log._report._time+": "+(Date.now()-_result._start)
                      +"\n"+_bzMessage._api._responseSize+": "+s.length
                      +"\n"+_bzMessage._common._message+": "+s.substring(0,300)+(s.length>300?" ...":"")
          
        }else{
          _curDetails=_result._details[_result.idx]
          _curDetails._type=r._type
          _curDetails._data.push({
            _url:a.url,
            _method:a.method,
            _end:_end,
            _start:_curDetails._curStart,
            _status:v.status,
            _data:s.length,
            _msg:r._type!=4?s:""
          })
        }
        
        if(r._type!=4){
          if(_result._details){
            _result._details[_result.idx]._end=Date.now()
          }
          _fun(_result)
        }else{
          _domActionTask._exeAPI(aa,_async,i+1,_fun,_result)
        }
      }

      //ignore testing on boozang host
      if(_ideLocation._ignoreHost.find(x=>{
        x=eval("/^(http|https)?:?[\/]*"+x+"/")
        return a.url.match(x)
      })){
        return alert("Not support")
      }
      _timerout=-1
      _Util._ajax(a,_proxy)

      _timerout=setTimeout(()=>{
        _result._type=1
        _result._msg="timeout"
        if(_result._details){
          _result._details[_result.idx]._end=Date.now()
          _result._details[_result.idx]._type=1
        }
        _fun(_result)
      },a.timeout||60000)
    }else{
      if(_result._details){
        _result._details[_result.idx]._end=Date.now()
      }
      _fun(_result)
    }

  },
  _exeResponseScript:function(d,r,_result){
    let $result=_result,dd,rr
    try{
      if(_result.data&&_result.data.constructor==String){
        eval("dd="+_result.data)
        if(dd.message){
          _result.message=dd.message
        }else if(_result.status>=400){
          _result.message=dd
        }
      }
      if(!_result.responseJSON){
        if(dd.responseJSON){
          _result.responseJSON=dd.responseJSON
        }
      }
      delete _result.data
    }catch(e){
      console.log(e.message)
      e.stack
    }
    try{
      var s=(d.responseScript||"").trim();
      if(s.match(/^\(function/)||s.match(/\(\(.*\)\s*\=\>/)){
        eval("rr="+s)
        r._type=rr||rr===undefined?4:2
        if(!rr||![Object,Array].includes(rr.constructor)){
          rr=0
        }
      }else{
        eval(s)
      }
    }catch(e){
      r._type=1
      r._errMsg=e.message+"\n"+e.stack
      r._msg+=e.message+"\nrequest response: "+_Util._getStringBySize($result.responseText,100)
    }
    if(!BZ._isAutoRunning()){
      try{
        r._returnData=$result
      }catch(e){}
    }
    return rr||_result.responseJSON
  },
  _exeSocket:function(r,_result,_fun){
    _domActionTask._websockets=_domActionTask._websockets||{};
    _domActionTask._socketBKFun=_fun;
    var _host=BZ._curEnv.items[r.host].host
    var w= _domActionTask._websockets[_host];
    if(!w){
      w=_domActionTask._websockets[r.url]=new WebSocket(_host);
      w.onmessage=function(d){
        $result=d
        d.responseText=d.data
        d=d.data;
        _domActionTask._exeResponseScript(r,_result)
        if(_result._type==2){
          var v=window._lastSocketData||""
          _result._msg="\n"+_bzMessage._task.UnMatch
          _result._msg+="\n"+_bzMessage._common._data+": "+v.substring(0,50)+(v.length>50?"... ("+v.length+")":"")
          _result._msg+="\n"+_bzMessage._diff._actual+": "+d.substring(0,50)+(d.length>50?"... ("+d.length+")":"")
        }
        _domActionTask._socketBKFun(_result)
      }
    }
    BZ._log("Socket Send out: "+r.data)
    window._lastSocketData=r.data
    _send()
    function _send(t){
      t=t||Date.now()
      if(w.readyState==1){
        w.send(r.data)
      }else if(w.readyState==3){
        w=_domActionTask._websockets[r.url]=new WebSocket(r.url);
        BZ._setTimeout(()=>{
          _send()
        },1000)
      }else if(Date.now()-t<3000||w.readyState==2){
        BZ._setTimeout(()=>{
          _send()
        },1)
      }else{
        _result._msg+=""
        _fun()
      }
    }
  },
  _validateByData:function(_data,_setting,_force){
    var _result=_domActionTask._extractDataByData(_data,_setting);
    if(_result._type==_taskInfo._type._error){
      return _result;
    }else{
      return _domActionTask._compareWithExpection(_data,_result._extractData,_force);
    }
  },
  _fetchMultipleFileDataFromURL:function(us,_fun,i,fs){
    i=i||0
    let u=us[i]
    fs=fs||[]
    if(u){
      _domActionTask._fetchFileDataFromURL(u,function(v){
        v.forEach(x=>fs.push(x))
        setTimeout(()=>{
          _domActionTask._fetchMultipleFileDataFromURL(us,_fun,i+1,fs)
        },1)
      })
    }else{
      _fun(fs)
    }
  },
  _fetchFileDataFromURL:function(uri,_fun) {
    try{
      let v=_eval._exeCode(uri)
      if(v.constructor==Array && v[0].base64Link){
        return _fun(v)
      }
    }catch(e){}
    if(extensionContent){
      bzTwComm._postToIDE({_scope:"_ideDataHandler",_fun:"_loadData",_args:[uri,"file",function(v){
        if(v && v.constructor==String){
          _ideDataHandler._loadData(uri,"file",_fun)
        }else{
          _fun(v)
        }
      }]})
    }else{
      _ideDataHandler._loadData(uri,"file",_fun)
    }
  },
  _postData:function(_data,_fun){
    if(bzTwComm._isIDE()){
      bzTwComm._postToExt({_fun:"_postData",_scope:"_domActionTask",_args:[_data,_fun]})
      return
    }
    if(_data.contentType&&_data.contentType.toLowerCase().includes("application/json")){
      _data.data=JSON.stringify(_data.data);
    }
    
    _data.success=function(v,r,rs){
      _fun({_result:"_success"})
    }
    _data.error=function(v,a,b){
      let _value=v.responseText?v.responseText.trim():v.statusText||"";
      _fun({_result:"_failed",_msg:_value})
    }
    $.ajax(_data)
  },
  _extractDataByData:function(_data,_setting){
    var _value=null;
    var _msg=null,_url=_Util._mergeURL(_setting._host,_data.api.httpURL||"/");
    BZ._log(_url)
    var _ajaxData={
      url:_url,
      type:_data.api.httpMethod,
      cache:false,
      async:false,
      success:function(v,r,rs){
        try{
          _value={status:rs.status,data:v};
          if(_data.type==_ideActionData._type._validation){
            _value=_CtrlDriver._sortJson(_doJsonIgnore(_value));
          }
          BZ._log(_value)
        }catch(e){
          BZ._log(e.stack)
        }
      },
      error:function(v,a,b){
        _value=v.responseText?v.responseText.trim():v.statusText||"";
      }
    };
    if(_data.api.contentType){
      _ajaxData.contentType=_data.api.contentType
    }
    if(_data.api.dataType){
      _ajaxData.dataType=_data.api.dataType
    }
    
    if(_data.api.downloadAsFile){
      
    }else{
      
    }
    function _doJsonIgnore(d){
      if(_data.content.type=="JSON"){
        var _ignore=_data.content.ignore
        if(_ignore){
          if(_ignore.attrs.status){
            delete d.status;
          }
          if(_ignore.attrs.data){
            delete d.data;
          }else if(_ignore.jsonKey || _ignore.jsonValue || _ignore.attrs.nullValue || _ignore.attrs.emptyValue){
            d.data=_domActionTask._getJsonAfterIgnore(d.data,_ignore.jsonKey,_ignore.jsonValue,_ignore.attrs.nullValue,_ignore.attrs.emptyValue);
          }
        }
      }
      return d;
    }
    if(_data.api.httpHeaders){
      if(_data.api.httpHeaders.constructor==String){
        try{
          eval("_ajaxData.headers="+_data.api.httpHeaders);
        }catch(e){
          alert(_bzMessage._system._dataFormat);
        }
      }else{
        _ajaxData.headers=_data.api.httpHeaders;
      }
    }
    if(_data.api.httpData){
      var ct=_data.api.contentType||""
      if(_data.api.httpData.constructor==String&&!ct.includes("application/json")){
        try{
          eval("_ajaxData.data="+_data.api.httpData);
        }catch(e){
          alert(_bzMessage._system._dataFormat);
        }
      }else{
        if(!ct.includes("application/json")&&_data.api.httpData.constructor!=String){
          _ajaxData.data=JSON.stringify(_data.api.httpData);
        }else{
          _ajaxData.data=_data.api.httpData;
        }
      }
    }
    $.ajax(_ajaxData);
    return {_type:_taskInfo._type._success,_extractData:_value};
  },
  _doScript:function(d,_fun){
    var $element;
    if(d.element){
      _domActionTask._setErrorPos({},"_element","_actionDetailsGeneral");
      $element = _domActionTask._findElement(d);
    }

    _domActionTask._setErrorPos({},"_script","_actionDetailsGeneral");
    if(d._tmpEndAction||d.endGroup){
      return _doIt()
    }
    _domActionTask._exeScript(d.script,null,$element,function(_back){
      if(_back&&_back.constructor==Function){
        _back(_doIt)
      }else{
        _doIt()
      }
    });
    function _doIt(w){
      if(bzTwComm._isIDE()){
        _apiDataHandler._registerExeFun(()=>{
          _final(w)
        },0,0,d)
      }else{
        _final(w)
      }
    }
    
    function _final(w){
      _ideDataManagement._tmpTaskDataMap._parameter[BZ._getCurModule()._data.code+BZ._getCurTest()._data.code]=$parameter
      if(_fun){
        let c=$util._canvas
        delete $util._canvas
        if(c){
          c={
            file:c
          }
        }
        _fun({_type:_taskInfo._type._success,_msg:w,_imgData:c})
      }
    }
  },
  _exeScript:function(c,$result,$element,_fun){
    let r={}
    if(c){
      window.$result=$result
      window.$element=$element
      c=_Util._parseToExeCode(c)
      console.log("_exeScript-2: "+c)
      c=_Util._eval(c)
      _fun(c)
    }
  },
  _validateScreenshot:function(_data,_force,_fun){
    var _result={
      _type:_taskInfo._type._failed
    }
    var _element=_data.element;
    _domActionTask._setErrorPos({},"_element","_actionDetailsGeneral");
    var _dom=_domActionTask._findElement(_data);
    var c=_data.content;
    var co=_data._orgData.content;
    c.left=co.left=co.left||0;
    c.right=co.right=co.right||0;
    c.top=co.top=co.top||0;
    c.bottom=co.bottom=co.bottom||0;
    
    _screenshotHandler._elementImgMd5(_dom,c,function(v){
      if(v && v.constructor==String){
        _result = _domActionTask._compareWithExpection(_data,v,_force);
      }else{
        _result._type=_taskInfo._type._error
        _result._msg=v.message;
      }
      _result._data=_data;
      _result._errorPos=_domActionTask._errorPos;
      if(_fun){
        _fun(_result)
      }
    });
  },
  _takeScreenshot:function(o,_fun){
    let ee=document.body;
    if(o){
      o.e=_domActionTask._findElement(o)
      if(o.e){
        ee=_Util._findTextElement(o.e)
      }else{
        o.e=ee
      }
    }else{
      o={e:ee}
    }
    _screenshotHandler._getElementAreaImg(ee,o.e,function(c) {
      o._img=c
      _bzDomPicker._removeTmpCover();
      _fun(c)
    });
  },
  //Validation action
  _compareWithExpection:function(d,v,_force){
    if(v && $.type(v)!="object" && $.type(v)!="string"){
      v=JSON.stringify(v,0,2);
    }
    var _result={};
    var _bRebuild=false;
    var _bNumber=false;
    var _org=v;
    if(v && v.constructor==String){
      v=v.replace(/\r\n/g,"\n");
    }
    var v1="";
    
    if (d.expection==undefined || d.expection==null || d.expection==""){
      v1="";
    }else{
      v1=(d.expection+"").replace(/\r\n/g,"\n");
    }
    if (d.md5 && !d.expection) {
      v=_calcMD5(v);
      v1=d.md5;
    }else if (_Util._isNumber(d.expection)) {
      v1=parseFloat(d.expection);
    }else{
      v=_compressJSON._convertToEntities(v);
      v1=_compressJSON._convertToEntities(v1);
    }

    var bOk=false;
    var _exe=null;
    v=(v+"").replace(/[\r\n]/g," ").replace(/\s+/g," ")
    v1=(v1+"").replace(/[\r\n]/g," ").replace(/\s+/g," ")
    
    //v: actual, v1: expection
    if(d.content&&["enable","disable","checked"].includes(d.content.type)){
      v=Boolean(v==0||v=="false"?false:v)
      v1=Boolean(v1==0||v1=="false"?false:v1)
      bOk=v==v1
    }else if(d.compareMark=="include"){
      bOk=v.includes(v1)
    }else if(d.compareMark=="exclude"){
      bOk!=v.includes(v1)
    }else if (d.compareMark!="regex") {
      if(d.compareMark=="=="){
        bOk=v==v1
      }else if(d.compareMark=="<="){
        bOk=v<=v1
      }else if(d.compareMark==">="){
        bOk=v>=v1
      }else if(d.compareMark=="<"){
        bOk=v<v1
      }else if(d.compareMark==">"){
        bOk=v>v1
      }else if(d.compareMark=="!="){
        bOk=v!=v1
      }
    }else if(_Util._isRegexData(v1)){
      bOk=Boolean(v.match(new Regex(v1)))
    }else{
      bOk=Boolean(v.match(v1))
    }

    if(!bOk){
      d._actual=_org;
      if(_force){
        if (d._orgData.expection===undefined || d===null || d===""){
          _bRebuild=true;
        }else{
          _bRebuild=true;
        }
      }
      if(_bRebuild){
        d._orgData.expection=_org;
        d._orgData.md5="";
        _result._type=_taskInfo._type._warning;
        _result._msg="_replaceExpection";
        _result._data=d;
      }else{
        _result._type=_taskInfo._type._failed;

        _result._msg=_bzMessage._task.UnMatch+": "+v1;
        _result._errSou=_taskInfo._errSou._exp;
        _result._newData=_org;
        if((d._orgData.expection||"").includes("{{")){
          _result._orgRealValue=v1;
        }
      }
    }else{
      _result._type=_taskInfo._type._success;
    }
    
    return _result;
  },
  _validateHtml:function(_data,_force){
    var _result=_domActionTask._extractDataByHtml(_data);
    for(var i=0;i<_domActionTask._taskQueue.length;i++){
      var t=_domActionTask._taskQueue[i];
      if(t.type==_ideActionData._type._triggerEvent && t.element){
        var e=_JSHandler._prepareData(t.element)
        t=_domActionTask._findElement(t);
        if(t){
          $util.triggerMouseEvent(t,"mouseover");
          $util.triggerMouseEvent(t,"mousemove");
        }
        break;
      }
    }
    if(_result._type==_taskInfo._type._success){
      if(!["exist","unexist","dnexist"].includes(_data.content.type)){
        if(_data.content.type=="data"){
          BZ._log("Validate data ......")
          _result = _domActionTask._compareWithDataExpection(_data,_result._extractData,_force);
          BZ._log(_result)
        }else{
          _result = _domActionTask._compareWithExpection(_data,_result._extractData,_force);
        }
        if(_result._type==_taskInfo._type._failed && _data._preDom && !_data._preDom._changed){
          _result._type=_taskInfo._type._notReady;
        }else{
          delete _data._preDom;
        }
      }else if(_data.content.type=="unexist"){
        _result._type=_taskInfo._type._failed
        _result._msg=_bzMessage._system._error._existError
      }
    }else if(_data.content.type=="unexist"){
      _result._type=_taskInfo._type._success
    }
    return _result;
  },
  _validateJs:function(_data,_fun,$parameter,$test,$module,$loop){
    $parameter=$parameter||window.$parameter
    $test=$test||window.$test
    $module=$module||window.$module
    $loop=$loop||window.$loop
    
    _domActionTask._extractDataByJs(_data,function(_result){
      if(_result._type==_taskInfo._type._success){
        if(!_result._extractData){
          _result._type=_taskInfo._type._failed
        }else if(_result._extractData=="bz-stop"){
          _result._bzStop=1
        }
      }
      return _fun(_result);
    },$parameter,$test,$module,$loop);
  },
  _extractDataByHtml:function(_data){
    var _element=_data.element;
    _domActionTask._setErrorPos({},"_element","_actionDetailsGeneral");
    var _dom=_domActionTask._findElement(_data);
    if(_dom){
      if(_data.type!=_ideActionData._type._extractData){
        var _content = null;
        var _cType=_data.content.type;
        if(["exist","unexist","dnexist"].includes(_cType)){
        }else if(_cType=="innerText"){
          _content=_Util._formatInnerText($util.getElementText(_dom,1));
          
          if(_data.content.preFormat){
            try{
              _content=_content.replace(new RegExp(_data.content.preFormat),_data.content.replace)
            }catch(e){
              if(!BZ._isAutoRunning()){
                alert(e.message)
              }
            }
            BZ._log("af"+"ter pr"+"eFormat")
            BZ._log(_content)
          }
        }else if(_cType=="value"){
          if(_dom.tagName=="SELECT"){
            _content=""
            for(var i=0;i<_dom.selectedOptions.length;i++){
              if(_content){
                _content+="\n"
              }
              _content+=_dom.selectedOptions[i].text
            }
          }else if(_dom.tagName=="INPUT"&&_dom.type=="checkbox"){
            _content=_dom.checked?"on":"off"
          }else{
            _content=_dom.value
          }
        }else if(_cType=="enable"){
          _content=!(_dom.disabled||$(_dom).attr("disabled")||"")
        }else if(_cType=="disable"){
          _content=(_dom.disabled||$(_dom).attr("disabled")||"")+""
        }else if(_cType=="checked"){
          _content=_dom.checked||$(_dom).attr("checked")||""
        }else if(_cType=="data"){
          _content=_dom;
        }
/*
        if(!["exist","unexist","dnexist"].includes(_cType)){
          _content=_domActionTask._maskContent(_content);
        }
*/
        if(_data._preDom){
          _data._preDom._changed=_calcMD5(_dom.outerHTML)!=_data._preDom.html
        }
      }else{
        _content=window.$element
      }
      BZ._log("ex"+"trac"+"tDat"+"aByH"+"tml")
      BZ._log(_content)
      return {
        _type:_taskInfo._type._success,
        _extractData:_content
      };
    }else{
      return {
        _type:_taskInfo._type._error,
        _msg:_bzMessage._system._error._missElement,
        _errSou:_taskInfo._errSou._element
      };
    }
  },
  _doDrag:function(d,_fun){
    let x=parseFloat(d.event.x||0),
        y=parseFloat(d.event.y||0),
        x2=parseFloat(d.event.moveToX||0),
        y2=parseFloat(d.event.moveToY||0);
    var tr=new DataTransfer(),te,
        _dom=_domActionTask._findElement(d);

    var _result={_type:_taskInfo._type._failed}
    
    var ps=[{_action:"mousedown", x:x, y:y}];
    let t=10,
        xs=(x2-x)/t,
        ys=(y2-y)/t;
    for(var i=0;i<t;i++){
      let xx=x+xs*i,
          yy=y+ys*i
      
      ps.push({_action:"mousemove", x:xx, y:yy})
    }
    ps.push({_action:"mousemove", x:x2, y:y2});
    ps.push({_action:"mouseup", x:x2, y:y2});
    _exeMouseGroup()
    
    function _exeMouseGroup(){
      var p=ps.shift()
      if(p){
        BZ._setTimeout(function(){
          $util.triggerMouseEvent(_dom,p._action,d.event.button,p.x,p.y,d.event.ctrl,d.event.alt,d.event.shift,tr);
          _exeMouseGroup()
        },100);
      }else{
        _fun({_type:_taskInfo._type._success,_errorPos:_domActionTask._errorPos})
      }
    }
  },
  _doDragdrop:function(d,_fun){
    var x=parseFloat(d.event.x||1),y=parseFloat(d.event.y||1);
    var tr=new DataTransfer(),te,r;

    var _result={_type:_taskInfo._type._failed}
    if(x>=0 && y>=0){
      var _element=d.element;
      _domActionTask._setErrorPos({},"_element","_actionDetailsGeneral");
      var _dom=_domActionTask._findElement(d),_dom2;
      if(d.event.element && d.event.element.length){
        let _lastTxtElement=_dom.bzTxtElement
        
        _dom2=_domActionTask._findElement(d.event);
        if(_dom2.tagName=="CANVAS"&&_dom2.bzTxtElement){
          r=_dom2.getBoundingClientRect()
          te=_dom2.bzTxtElement
          x=r.left+te.x+te.w/2
          y=r.top+te.y+te.h/2

          if(d.event.offset){
            var xy = _Util._getDomXY(_dom2);
            let aa={
              x:parseFloat(xy.x)+_dom2.bzTxtElement.x,
              y:parseFloat(xy.y)+_dom2.bzTxtElement.y,
              h:_dom2.bzTxtElement.h,
              w:_dom2.bzTxtElement.w
            }
            let _offset=_bzDomPicker._getOffsetPoint(aa,d.event.offset)
            x=_offset.x
            y=_offset.y
          }


          if(_lastTxtElement&&_dom==_dom2){
            _dom.bzTxtElement=_lastTxtElement
          }
        }
      }
      if(!_dom2){
        _dom2=_Util._getElementByXY(_dom.ownerDocument.body,d.event.x,d.event.y)
      }
      var xy=_Util._getDomXY(_dom);
      var _rect=_dom.getBoundingClientRect();
      if(_dom.tagName=="CANVAS"&&_dom.bzTxtElement){
        te=_dom.bzTxtElement;

        xy.x=_rect.left+te.x+te.w/2
        xy.y=_rect.top+te.y+te.h/2
      }else{
        xy.x+=parseInt(_rect.width/2);
        xy.y+=parseInt(_rect.height/2);
      }
      var t=10;
      var xs=parseInt((x-xy.x)/t);
      var ys=parseInt((y-xy.y)/t);

      var ps=[{_action:"mousedown", x:xy.x, y:xy.y}];
      
      // if(_dom.tagName=="CANVAS"&&_dom.bzTxtElement){
        // ps=[{_action:"mousedown", x:-1, y:-1}];
      // }
      
      ps.push({_action:"dragstart", x:xy.x, y:xy.y,tr:tr});
      ps.push({_action:"drag", x:xy.x, y:xy.y,tr:tr});
      
      for(var i=0;i<t;i++){
        let xx=xy.x+=xs,
            yy=xy.y+=ys
        
        if(r&&r.left<xx&&r.right>xx&&r.top<yy&&r.bottom>yy){
          ps.push({_action:"mousemove", x:xx, y:yy,_dom:_dom2})
        }else{
          ps.push({_action:"mousemove", x:xx, y:yy})
        }
      }

      ps.push({_action:"mousemove", x:x, y:y,_dom:_dom2});
      ps.push({_action:"dragenter", x:x, y:y,_dom:_dom2,tr:tr});
      ps.push({_action:"dragover", x:x, y:y,_dom:_dom2,tr:tr});
      ps.push({_action:"mouseup", x:x, y:y,_dom:_dom2});
      ps.push({_action:"drop", x:x, y:y,_dom:_dom2,tr:tr});
      ps.push({_action:"dragend", x:x, y:y,tr:tr});
      _exeMouseGroup()
      
      function _exeMouseGroup(){
        if(ps.length){
          var p=ps.shift()
          BZ._setTimeout(function(){
            $util.triggerMouseEvent(p._dom||_dom,p._action,d.event.button,p.x,p.y,d.event.ctrl,d.event.alt,d.event.shift,p.tr);
            _exeMouseGroup()
          },100);
        }else{
          _fun({_type:_taskInfo._type._success,_errorPos:_domActionTask._errorPos})
        }
      }
    }else{
      _domActionTask._setErrorPos({},"xy","_actionDetailsGeneral");
      _result._errorPos=_domActionTask._errorPos;
      _fun(_result)
    }
  },
  //Trigger event action
  _trigger:function(d,_fun){
    if(d.type==1){//event only
      _domActionTask._prepareValidation();
    }
    var _result={_type:_taskInfo._type._success},dd;
    try{
      dd=d.event.alerts||(d.event.popType?[{
        popType:d.event.popType,
        expection:d.expection,
        returnValue:d.event.returnValue,
        popFollow:d.event.popFollow
      }]:0)
      if(dd){
        _TWHandler._popExpected.alert=[]
        _TWHandler._popExpected.confirm=[]
        _TWHandler._popExpected.prompt=[]
        dd.forEach(ddd=>{
          _TWHandler._popExpected[ddd.popType].push({
            expection:ddd.expection,
            returnValue:ddd.returnValue,
            popFollow:ddd.popFollow
          });
        })
      }
      
      _domActionTask._setErrorPos(_result,"_element","_actionDetailsGeneral");
      var dom=_domActionTask._findElement(d);
      
      if(["BUTTON","INPUT","TEXTAREA","SELECT"].includes(dom.tagName)){
        if(dom.disabled){
          _result._type=_taskInfo._type._error
          _result._msg=_bzMessage._system._error._disableElement
          _result._errSou=_taskInfo._errSou._element;
          if(_fun){
            _fun(_result)
          }
          return
        }
      }

      var _eType=d.event.type;
      var _action=d.event.action;
      //keypress
      if (_eType=="key") {
        if(d.event.groupKeys){
          return _triggerKeyGroup(dom,d.event.groupKeys,0)
        }else if(_action=="group"){
          return $util.triggerKeyEvents(dom,d.event.keyCode,d.event.charCode,d.event.ctrl,d.event.alt,d.event.shift,_doAfterKeyEvent);
        }else{
          $util.triggerKeyEvent(dom,_action,d.event.keyCode,d.event.charCode,d.event.ctrl,d.event.alt,d.event.shift);
        }
        if(_Util._isStdInputElement(dom) && (d.event.char || d.event.groupKeys) && _action=="group"){
          $util.triggerChangeEvent(dom,$(dom).val(),1,_result,0,0,0,1)
        }
      //mouse (click)
      }else if (_eType=="mouse") {
        _domActionTask._preCkRepElement(d,_result)

        if(_result._type!=_taskInfo._type._error){
          _Util._removeLinkTarget(dom);
          if(["group","click"].includes(_action) && d.event.button!=2){
            return $util.triggerMouseEvents(dom,parseInt(d.event.button)||1,d.event.x,d.event.y,d.event.ctrl,d.event.alt,d.event.shift,function(){
              if(!_checkPop()){
                return
              }
              if(d._reTrigger){
                return _fun(_result)
              }
              return _exeRepElementAction(d,_result,_fun)
            });
          }else if(_action=="DOMMouseScroll"){
            $util.triggerWheelEvent(dom,d.event.y);
          }else if(_action=="dblclick"){
            $util.triggerDblClickEvents(dom,parseInt(d.event.button)||1,d.event.x,d.event.y,d.event.ctrl,d.event.alt,d.event.shift);
            return _exeRepElementAction(d,_result,_fun)
          }else{
            return $util.triggerMouseEvent(dom,_action,d.event.button,d.event.x,d.event.y,d.event.ctrl,d.event.alt,d.event.shift,0,function(){
              return _exeRepElementAction(d,_result,_fun)
            });
          }
        }
      //change
      }else if(_eType=="change"){
        var v=(d.event.value||"")
        if(v.constructor!=Array){
          v+=""
        }
        if(["bz-skip-group"].includes(v)){
          _result._bzSkipGroup=1
          if(_fun){
            _fun(_result)
          }
          return;
        }else if(["bz-skip"].includes(v)){
          _result._bzSkip=1
          if(_fun){
            _fun(_result)
          }
          return;
        }else if(v=="bz-stop"){
          _result._bzStop=1
          if(_fun){
            _fun(_result)
          }
          return;
        }
        if(!d._customize&&_domActionTask._isCustomizeAction(d)){
          return _domActionTask._exeCustomizeAction(d,_result,_fun)
        }else if(dom.type=="radio"){
          try{
            if(v.startsWith("/{random")){
              dom=$util.randomItem($("input[name='"+dom.name.replace(/'/g,"\\'")+"']").toArray()).value
              v=dom.value
              _domActionTask._setRandomValueToVariable(v,d)
            }else{
              dom=$("input[name='"+dom.name.replace(/'/g,"\\'")+"'][value='"+v.replace(/'/g,"\\'")+"']")[0]||dom
            }
          }catch(e){}
          $util.triggerMouseEvents(dom,1,0,0,0,0,0);

        }else if (dom.type && dom.type=="checkbox") {
          if((!d.event.value||d.event.value=='off'||d.event.value=="false") != !dom.checked){
            $util.triggerMouseEvents(dom,1,0,0,0,0,0);
          }
        }else if(_cssHandler._isNatureCustomizeInput(dom)){
          /**********************************/
          //set value on customize dropdown 
          /**********************************/
          return _domActionTask._exeSetValueOnUnInput(d,dom,function(v){
            _result._type=v
            _fun(_result)
          })
        }else{
          try{
            if(dom.tagName=="INPUT" && dom.type=="file" && bzTwComm._isExtension()){
              if(v && v.constructor==String){
                if(v.match(/^[\/]?example\..+$/)){
                  v=SERVER_HOST+"/file/"+v.replace("/","")
                }
                _domActionTask._fetchFileDataFromURL(v,function(v){
                  _setFileFun(d,dom,v,_fun)
                })
              }else if(v&&v.constructor==Array&&v[0]&&v[0].constructor==String){
                _domActionTask._fetchMultipleFileDataFromURL(v,function(v){
                  _setFileFun(d,dom,v,_fun)
                })
              }else{
                _setFileFun(d,dom,v,_fun)
              }
              return
            }else if(v.constructor==Array&&dom.tagName=="SELECT"){
              for(let k of dom.options){
                if(v.includes(k.text)){
                  $(k).prop("selected",true)
                }else{
                  $(k).prop("selected",false)
                }
              }
            }else if(v.startsWith("/{random")&&dom.tagName=="SELECT"){
              let vs=[],e=v.split(":")[1],f,os
              if(e){
                e=e.split("|")
                f=e[0]
                e=e[1]
                if(e){
                  if(e.endsWith("}/")){
                    e=e.substring(0,e.length-2).split(",")
                  }
                }
              }
              if(f&&f[0]=="!"){
                f=f.substring(1)
                if(f.endsWith("}/")){
                  f=f.substring(0,f.length-2)
                }
                os=$(dom).find("*").not(f).toArray()
              }else{
                os=$(dom).find(f||"option").toArray()
              }
              
              for(var i =0;i<os.length;i++){
                let x=os[i].text
                if(x&&(!e||!e.includes(x))){
                  vs.push(x)
                }
              }
              v=$util.randomItem(vs).value
              _domActionTask._setRandomValueToVariable(v,d)
            }
            return $util.triggerChangeEvent(dom,v,d.event.autoBlur,_result,d.withEntry,d.withSubmit,function(){
              _doAfterKeyEvent()
            },d.disableAISet);
          }catch(ex){
            //DO NOT REMOVE!!!!
            //Sometime trigger customer key event error
            console.log(e.stack)
          }
        }
      }
      if(!_checkPop()){
        return
      }
    }catch(e){
      _result._type=_taskInfo._type._error;
      _result._msg=_bzMessage._system._error._missElement;
      _result._errSou=_taskInfo._errSou._element;
    }
    if(_fun){
      _fun(_result)
    }
    
    function _exeRepElementAction(d,_result,_fun){
      return _domActionTask._ckRepElement1(d,_result,function(){
        if(_fun){
          _fun(_result)
        }
      })
    }
    function _setFileFun(d,dom,v,_fun){
      var p=_Util._getQuickPath(dom)
      return BZ._setTimeout(function(){
        $util.triggerChangeEvent(dom,v,d.event.autoBlur);
        if(_fun){
          BZ._setTimeout(()=>{
            _fun(_result)
          },1000)
        }
      },100)
    }
    function _triggerKeyGroup(dom,s,i){
      if(i>=s.length){
        return _doAfterKeyEvent()
      }
      var c=s[i].charCodeAt(0),k;
      if(c==10){
        k=13;
      }else{
        k=c-32;
      }
      $util.triggerKeyEvents(dom,k,c,false,false,false,function(){
        _triggerKeyGroup(dom,s,i+1)
      });
    }
    function _doAfterKeyEvent(){
      if(_Util._isStdInputElement(dom) && (d.event.char || d.event.groupKeys) && _action=="group"){
        $util.triggerChangeEvent(dom,$(dom).val(),1,_result,0,0,0,1)
      }
      if(!_checkPop()){
        return
      }
      if(_fun){
        _fun(_result)
      }
    }
    function _checkPop(){
      if(!_IDE._data._curVersion.setting.content.ignorePopValidation){
        var _popAction=localStorage.getItem("BZ-Action-pop");
        if(!_popAction){
          var _msgObj = _TWHandler._chkPopInfo(d);
          if(_msgObj && _msgObj=="wait"){
            localStorage.setItem("BZ-Action-pop",_result)
            return _recheck(0)
            
            function _recheck(i){
              BZ._setTimeout(function(){
                _msgObj = _TWHandler._chkPopInfo(d,i==100?1:0);
                if(_msgObj && _msgObj=="wait" && i<100){
                  return _recheck(++i);
                }else if(_msgObj){
                  _setPopResult(_msgObj);
                }
                _fun(_result)
              },100);
            }
          }else if(_msgObj){
            localStorage.setItem("BZ-Action-pop",_result)
            _setPopResult(_msgObj);
          }
          function _setPopResult(_msgObj){
            _result._type=_taskInfo._type._failed;
            _result._msg=_msgObj;
            _result._missingPopMsg=true;
            _result._errSou=_taskInfo._errSou._element;
            localStorage.removeItem("BZ-Action-pop");
          }
        }else{
          localStorage.removeItem("BZ-Action-pop");
        }
      }
      return 1
    }
  },
  _getActionExpectReactionTime:function(a){
    return parseInt(a.max||((_IDE._data._setting.advanced[a._supData?a._supData.hostId||0:0]||{}).expectReactionTime)||2000);
  },
  /**********************************/
  //set value on customize dropdown 
  //a: action, e: element
  /**********************************/
  _exeSetValueOnUnInput:function(a,e,_bkFun,_ignoreForce){
    let _curInputDom=e
    _domActionTask._doLog("Auto set uninput value on: "+e.outerHTML)
    if(!_ignoreForce){
      let _focus=$(":focus")[0]
      if(_focus){
        return $util.triggerBlurEvent(_focus,function(){
          setTimeout(()=>{
            _domActionTask._exeSetValueOnUnInput(a,e,_bkFun,1)
          },10)
        })
      }
    }
    
    _Util._preTriggerEvent()

    let _values=_Util._clone(a.event.value),
        _value=a.event.value,//current value
        rs,//request
        // cs,//UI exist item;
        _times,
        _valueIdx=0,
        _newElements=[],
        _preValue=_Util._toTrimSign(_cssHandler._getElementScope(e).innerText),
        _start=Date.now(),
        _period=_domActionTask._getActionExpectReactionTime(a)

    if(_values.constructor!=Array){
      _values=[a.event.value]
    }

    if(_selectOption(e,_values,function(r){
      return _bkFun(r)
    })){
      return
    }
    if(_selectMultip(e,_values,a)){
      return _bkFun(4)
    }

    // _prepareValues()
    let _elementList=_getElementList(e)
        // _observer=_buildObserver();

    if(e&&e.innerText==a.event.value){
      _Util._log("Exe Click of no-input")
      return _exeClick(e,0,function(){
        BZ._setTimeout(()=>{
          _newElements=_Util._getDiffAfterTriggerEvent(1,1);
          if(_newElements.length){
            _findTarget(0,_doIt)
          }else{
            _bkFun(4)
          }
        },100)
      })
    }

    _doIt()
    
    function _selectOption(e,_options,_fun){
      let os=_cssHandler._getOptionElementByBZFlag(e)||_cssHandler._isList(e,1),
          r=4
      if(os){
        _options.find((x,i)=>{
          if(x=="/{random}/"){
            if(a._requestErgodicDom&&!a._requestErgodicDom._ergodicValueList){
              d._ergodicValueList=os
            }else{
              _Util._randomList(os)
            }
            x=os[0]
          }
          if(!os.find((o,j)=>{
            if(o==x||o.innerText.toLowerCase()==x.toLowerCase()){
              _exeClick(o)
              os.splice(j,1)
              return 1
            }
          })){
            r=1
            return 1
          }
        })
        _fun(r)
        return 1
      }
    }

    function _doIt(){
      _value=_values[_valueIdx]
      _TWHandler._curRequestList.length=0
      _times=0
      if(_value){
        if(!_valueIdx){
          // cs=$(":equal("+_value+")").toArray(),
          // _Util._spliceAll(cs,c=>{
            // return _Util._isHidden(c)
          // })
          _exe(_elementList,0)
        }else{
          // cs=[]
          BZ._setTimeout(()=>{
            _findTarget(0,function(v){
              _fun(v)
            })
          },BZ._isAutoRunning()?0:500)
        }
      }else{
        _end(4)
      }
    }
    
    function _fun(v){
      if(v){
        _valueIdx++
        //Do next value
        _doIt()
      }else{
        //result is Failed
        _end(1)
      }
    }
    
    function _end(v){
      // _observer.disconnect();
      _exeClick(BZ.TW.document.body,0,function(){
        _bkFun(v)
      })
    }
    
    function _exe(es){
      let x=es.shift(),
          _curFun;
      if(x&&Date.now()-_start<60000){
        let er=x.getBoundingClientRect()
        if(!er.height||!er.width){
          return _exe(es)
        }
        if(_Util._isInputObj(x,1)){
          if(_isEditableInput(x)&&_value!="/{random}/"){
            _curFun=_exeChange
          }else{
            return _exe(es)
          }
        }else{
          _curFun=_exeClick
        }
        _curFun(x,1,function(v){
          if(v){
            $(x).blur()
            _fun(1)
          }else{
            _exe(es)
          }
        })
      }else{
        _fun()
      }
    }
    
    function _exeChange(o,_continueTarget,_fun){
      $util.triggerChangeEvent(o,_value,0,0,0,0,function(){
        _domActionTask._doLog("auto fill input: "+o.outerHTML)
        _findTarget(_cssHandler._getElementScope(o),_fun,1)
      },1)
    }
    
    function _exeClick(o,_continueTarget,_fun){
      $util.triggerMouseEvents(o,1,0,0,0,0,0,function(){
        setTimeout(()=>{
          _continueTarget?_findTarget(_cssHandler._getElementScope(o),_fun):_fun&&_fun(1)
        },100)
      })
    }
    
    function _findTarget(_exceptScope,_fun,_fromInput,_waitTimes){
      _waitTimes=_waitTimes||0
      BZ._setTimeout(()=>{
        if(_TWHandler._curRequestList.length){
          if(!rs){
            rs=_Util._clone(_TWHandler._curRequestList)
          }
          if(rs.find(r=>{
            return _TWHandler._curRequestList.find(rr=>{
              return rr.url==r.url
            })
          })){
            return _findTarget(_exceptScope,_fun,_fromInput,_waitTimes)
          }
        }
        if(!_findItem(_exceptScope,"equal")&&!_findItem(_exceptScope,"Contains")){
          _newElements=_Util._getDiffAfterTriggerEvent(1,1);
          if(_fromInput||!_newElements.find(n=>{
            if(n.nodeType!=1){
              n=n.parentElement
            }
            if(!n){
              return
            }
            if(a.event.fromPanel&&!$(n).is(a.event.fromPanel)){
              return
            }
            let os=_Util._findInputs(n)
            
            return os.find(o=>{
              if(_isEditableInput(o)&&_value!=="/{random}/"){
                _exeChange(o,1,_fun)
                return 1
              }
            })
          })){
            if((_waitTimes<10&&!_fromInput)||Date.now()-_start<_period){
              _findTarget(_exceptScope,_fun,_fromInput,_waitTimes+1)
            }else{
              _fun()
            }
          }
        }else{
          _fun(1)
        }
      },50)
    }
    
    function _findItem(_exceptScope,_bzPathMethod){
      _newElements=_Util._getDiffAfterTriggerEvent(1,1);
      return _newElements.find(n=>{
        if(a.event.fromPanel&&!$(n).is(a.event.fromPanel)){
          return
        }
        if(_exceptScope){
          if(n.nodeType!=1){
            n=n.parentElement
          }
          if(!n){
            return
          }
          let nt=n.getBoundingClientRect(),
              et=_exceptScope.getBoundingClientRect()
          if(_exceptScope==n||$(_exceptScope).find(n).length){
            return
          }
        }

        if(_value=="/{random}/"){
          let _random=_findRandomValue(n,a.event.valueStyle)
          if(!_random){
            return
          }else{
            _values[_valueIdx]=_value=_random
            try{
              let vv=a._orgData.event.value
              if(vv.match(/^\{\{.+\}\}$/s)){
                vv=vv.substring(2,vv.length-2)
                if(_values.length==1){
                  _Util._eval(vv+"=_value",{_value:_value})
                }else{
                  _Util._eval(vv+"=_values",{_values:_values})
                }
              }
            }catch(e){}
          }
        }
        _Util._newFindDom()
        let os=$(n).find(":"+_bzPathMethod+"("+_value+")").toArray().reverse();
        
        if(os.length){
          let _triggered=0
          os.forEach(o=>{
            let or=o.getBoundingClientRect()
            if(or.width&&or.height&&(!a.event.valueStyle||os.includes(_cssHandler._getElementScope(o,a.event.valueStyle)))){
              _triggered=1
              $util.triggerMouseEvents(o,1,0,0,0,0,0)
              return 1
            }
          })
          return _triggered
        }
      })
    }
    
    function _findRandomValue(o,_style){
      if(o.tagName=="BODY"){
        return
      }
      let os=_Util._getTargetElement($(o).find(":endContains(/./)"))
      _Util._spliceAll(os,x=>{
        return !$util.getElementText(x)||!_Util._toTrimSign(x.innerText)||_Util._isHidden(x)||x.getBoundingClientRect().width<5||x.getBoundingClientRect().height<5||(_style&&!_cssHandler._getElementScope(x,_style))
      })

      _Util._filterEndElementList(os)

      if(!BZ._isPlaying()&&a._requestErgodicDom&&_Util._isEmpty(a._requestErgodicDom._ergodicValueList)){
        a._requestErgodicDom._ergodicValueList=os.map(x=>$util.getElementText(x)).filter(x=>x)
        if(_Util._isEmpty(a._requestErgodicDom._ergodicValueList)){
          return
        }
        a._requestErgodicDom._ergodicIdx=0
        return a._requestErgodicDom._ergodicValueList[0]
      }
      while(os.length){
        o=$util.randomItem(os)
        if(o&&o.value){
          let v=$util.getElementText(o.value)
          if(!_preValue||_Util._toTrimSign(v)!=_preValue||os.length==1){
            return v
          }
        }else{
          return
        }
      }
    }
    function _isEditableInput(o){
      let or=o.getBoundingClientRect()
      return o.tagName=="INPUT"&&!o.readonly&&!$(o).attr("readonly")&&!$(o).attr("disabled")&&!o.disabled&&or.width&&or.width&&!["checkbox","radio","file"].includes(o.type)
    }
    function _getElementList(e){
      let s=_cssHandler._getElementScope(e)
      let es=$(s).find("*").toArray()
      
      es.splice(es.indexOf(e),1)
      es.unshift(e)
      es.push(s)
      es.find(x=>{
        if(_Util._isInputObj(x,1)&&!_Util._isHidden(x)&&!["checkbox","radio","file"].includes(x.type)){
          es.unshift(x)
          return 1
        }
      })
      return es
    }

    // function _buildObserver(){
      // let _observer=new MutationObserver(function(_mutations) {
        // _mutations.forEach(m=>{
          // let a=m.addedNodes[0]
          // if(a&&!_newElements.includes(a)){
            // if(a.nodeType==1){
              // _newElements.push(a)
            // }
          // }else if(!m.removedNodes.length){
            // let t=m.target
            // if(t&&t.nodeType==1&&t.tagName!="BODY"){
              // if(!_newElements.includes(t)){
                // _newElements.push(t)
              // }
            // }
          // }
        // })
      // })
      
      // _observer.observe(BZ.TW.document.body,{
        // childList:true,
        // subtree:true,
        // characterData: true,
        // attributes:true,
        // attributeFilter: ['style','class'],
        // attributeOldValue:true
      // });
      // return _observer
    // }
    
    function _selectMultip(e,vs,a){
      let ws=$util.getElementText(e).split(/\s/),
          _chkEqual=`:endEqual(/${vs.join("|")}/)`,
          os
      if(vs.find(x=>{
        return !ws.includes(x)
      })){
        return 
      }
      if(a.event.selectStyle||a.event.valueStyle){
        if(a.event.valueStyle){
          os=$(e).find(a.event.valueStyle).toArray()
          let oo=[];
          os.forEach(x=>{
            let xx=$(x).find(_chkEqual)
            if(!xx.length){
              if($(x).is(_chkEqual)){
                oo.push(x)
              }
            }else{
              oo=oo.concat(xx.toArray())
            }
          })
          os=$(oo)
        }else{
          os=$(e).find(_chkEqual)
        }
        if(os.length!=vs.length){
          return
        }
        if(a.event.selectStyle){
          let ss=$(e).find(a.event.selectStyle+_chkEqual).toArray();
          os=os.toArray()
          _Util._spliceAll(os,x=>{
            if(ss.includes(x)||$(ss).find(x)[0]){
              return 1
            }
          })
          $(os).click()
        }else{
          os.click()
        }
      }else{
        os=$(e).find(`INPUT[type=checkbox]:near(/${vs.join("|")}/)`)
        if(os.length){
          $(e).find(`INPUT[type=checkbox]:checked`).click()
          $(os).click()
        }else{
          return
        }
      }
      return 1
    }
  },
  _isCustomizeAction:function(d){
    return d._customize=_cssHandler._getCustomizeGroupByElementPath(d.element,d.customize)
  },
  _setRandomValueToVariable:function(v,a){
    if(_Util._hasCode(a._orgData.event.value)){
      try{
        let cc=a._orgData.event.value.replace(/[\{\}]/g,"")
        _Util._eval(cc+"=v",{v:v})
      }catch(e){
      }
    }
  },
  _mouseoverItems:function(e,ck,_fun){
    let _org=e
    $util.triggerMouseEvent(e,"mouseover")
    $util.triggerMouseEvent(e,"mousemove")
    BZ._setTimeout(function(){
      if(!_chkFun(e)){
        _triggerChildren(e)
        BZ._setTimeout(function(){
          if(!_chkFun(e)){
            let p=_triggerParents(e,_org)
            BZ._setTimeout(function(){
              if(!_chkFun(p)){
                _fun()
              }
            },10)
          }
        },10)
      }
    },10)
    
    function _triggerParents(e,_org){
      e=e.parentElement
      let r=_org.getBoundingClientRect()
      let pr=e.getBoundingClientRect()
      if(pr.width<=r.width+50&&pr.width>=r.width&&pr.height<=r.height+10&&pr.height>=r.height){
        $util.triggerMouseEvent(e,"mouseover")
        $util.triggerMouseEvent(e,"mousemove")
        return _triggerParents(e,_org)
      }else{
        return e
      }
    }
    
    function _triggerChildren(e){
      for(var i=0;i<e.children.length;i++){
        let ee=e.children[i]
        $util.triggerMouseEvent(ee,"mouseover")
        $util.triggerMouseEvent(ee,"mousemove")
        _triggerChildren(ee)
      }
    }
    
    function _chkFun(e){
      let o=$(e).find(ck)[0]
      if(o){
        _fun(o)
        return 1
      }
    }
  },
  _clearValue:function(d,_doIt,_fun){
    let e=_cssHandler._getOutestCover(d.e)
    let _clear="";
    if(d._customize.clear){
      _clear=d._customize.clear.join(" ")
      if(d._customize.clear.length==1){
        if(_clear.match(/^[\.\#]/)){
          _clear=":css("+_clear+")"
        }
      }
    }else{
      return _fun&&_fun()
    }
    //Clear value
    _cssHandler._findCloserElement(e,_clear,function(b){
      if(!b){
        _domActionTask._trigger({
          type:1,
          element:d.element,
          event:{type:"mouse",action:"click"}
        },function(r){
          BZ._setTimeout(function(){
            _cssHandler._findCloserElement(e,_clear,function(b){
              if(b&&b.tagName=="INPUT"){
                _domActionTask.as=[{
                  type:1,
                  e:b,
                  element:_cssHandler._findPath(b),
                  event:{type:"key",action:"change",value:""}
                }]
              }else{
                _domActionTask.as=[{
                  type:1,
                  e:b,
                  element:b?_cssHandler._findPath(b):["BZ.TW.document",_clear,0],
                  event:{type:"mouse",action:"click"}
                },{
                  type:1,
                  element:["BZ.TW.document","BODY",0],
                  event:{type:"mouse",action:"click"}
                }]
              }
              _doIt([],_fun)
            })
          },500)
        })
      }else{
        if(b.tagName=="INPUT"){
          _domActionTask.as=[{
            type:1,
            e:b,
            element:_cssHandler._findPath(b),
            event:{type:"key",action:"change",value:""}
          }]
        }else{
          _domActionTask.as=[{
            type:1,
            e:b,
            element:_cssHandler._findPath(b),
            event:{type:"mouse",action:"click"}
          }]
        }
        BZ._setTimeout(function(){
          _doIt([],_fun)
        },500)
      }
    })
  },
  _exeCustomizeAction:function(d,_result,_fun){
    var _inRecording=BZ._isRecording(),
        j=0,vs=[],_timer=0,_maxTime=parseInt(d.max);
    _domActionTask.as=[]
    let _values=d.event.value.replace(/(^\||\|$)/,"").split("|")
    if(d._customize.value&&d.event.value){
      var _valueElement=_cssHandler._findCloseElement(d.e,d._customize.value)
      if(_valueElement){
        _valueElement=_valueElement.value||$util.getElementText(_valueElement)||""
        if(_valueElement){
          vs=d.event.value.split("|")
          _Util._spliceAll(vs,v=>{
            if(_valueElement.match(new RegExp("(^| )"+v+"( |$)"))){
              _valueElement=_valueElement.replace(new RegExp("(^| )"+v+"( |$)"),"")
              return 1
            }
          })
          if(!vs.length&&!_valueElement.trim()){
            return _fun({_type:4})
          }else if(!_valueElement.trim()){
            return _triggerToggle(vs)
          }else{
            return _domActionTask._clearValue(d,_doIt,function(r){
              if(r&&r._type==1){
                r._msg=_bzMessage._setting._objectLib._missCloser
                _fun(r)
              }else{
                _triggerToggle(_values)
              }
            })
          }
        }
      }
    }
    if(!d.event.value&&d._customize.clear){
      return _domActionTask._clearValue(d,_doIt,function(r){
        _fun(r)
      })
    }
    
    _triggerToggle(_values)
    function _triggerToggle(_values){
      _doTrigger({
        type:1,
        element:_Util._clone(d.element),
        event:{type:"mouse",action:"click"},
        errOnHidden:"on"
      },function(){
        BZ._setTimeout(()=>{
          _fillValue(_values)
        },100)
      })
    }

    
    function _fillValue(_values){
      let _value=_values.shift()
      _value=_getRandomValue(_value,d._customize)||_value
      d._customize.steps.forEach(function(v,j){
        if(_inRecording&&v.event.type=="change"&&_value=="*"){
          return
        }
        if(_values.length&&j==d._customize.steps.length-1&&(!v.element||!v.element.join(" ").includes("$"))){
          return
        }
        v=_Util._clone(v)
        if(v.element&&v.element.length){
          v.element.unshift(d._customize.panel.join(" "))
          v.element.unshift(d.element[0])
        }else{
          v.element=["BZ.TW.document","BODY",0]
        }
        v.errOnHidden="on"
        _domActionTask.as.push(v)
      })

      vs=_domActionTask._retrieveWordsInFormat(_value,d._customize.format)

      if(_inRecording){
        BZ._triggerSetStatus(0)
        return BZ._setTimeout(function(){
          _doIt([],function(r){
            if(_values.length){
              _fillValue(_values)
            }else{
              _fun(r)
            }
          })
        },100)
      }
      _doIt(vs,function(r){
        if(r._type!=4){
          if(r.a){
            r._msg+=" ("+_ideActionManagement._getAutoDescription(r.a,1).trim()+")"
          }
          return _fun(r)
        }
        if(_values.length){
          _fillValue(_values)
        }else{
          _fun(r)
        }
      })
    }
    
    function _getRandomValue(v,c){
      v=v.match(/^\/\{random:?(.*)\}\/$/)
      let cc,nv;
      if(v){
        v=v[1]
        
        if(v){
          v=v.split("|")
          cc=v.shift()
          nv=v
        }
        v=_getOptionsFromPanel(cc?[cc]:c.panel,c.steps,nv)
        return $util.randomItem(v).value
      }
    }
    
    function _getOptionsFromPanel(pp,s,nv){
      pp=_Util._clone(pp)
      pp.unshift("BZ.TW.document")
      let p=_Util._clone(pp)
      p.push(0)
      p=$util.findDom(p)
      if(p){
        if(s.find(i=>{
          if(i.event&&i.event.type=="mouse"){
            i.element.forEach(oi=>{
              if(!$.isNumeric(oi)){
                let vv=oi.replace(/\$[0-9]+/g,"*")
                pp.push(vv)
              }
            })

            pp=_Util._findDoms(pp)||[]

            return 1
          }
        })){
          p=[]
          pp.forEach(pi=>{
            pi=$util.getElementText(pi).trim()
            if(pi){
              p.push(pi)
            }
          })
          
          nv&&_Util._spliceAll(p,v=>{
            return nv.includes(v)
          })
          return p
        }
      }
    }
    function _doIt(vs,_bkFun){
      var a=_domActionTask.as.shift()
      for(var i=vs.length;i>0;i--){
        if(a.event.value){
          a.event.value=a.event.value.replace("$"+i,vs[i-1])
        }
        a.element.forEach(function(v,jj){
          var vv=vs[i-1]
          if(vv){
            if(v.constructor==String){
              a.element[jj]=v.replace("$"+i,vs[i-1])
            }
            if(!a.event.value){
              a.event.value=vv
            }
          }
        })
      }
      var vv=a.event.value;
      if(vv=="*"){
        var oo=_domActionTask._findElement(a)
        if(oo){
          _cssHandler._findPath(oo)
          vv=_descAnalysis._retrieveTextForElementPathItem(oo.bzTmp)
        }
      }
      _findDom(a.element,function(o){
        if(!BZ._isAutoRunning()){
          _bzDomPicker._flashTmpCover(a.element)
          BZ._setTimeout(()=>{
            _doTrigger(a,0,_bkFun)
          },300)
        }else{
          _doTrigger(a,0,_bkFun)
        }
      })
      function _findDom(p,_bkFun,_time){
        _time=_time||Date.now()
        let o=$util.findDom(p,1)
        if(!o&&_maxTime>Date.now()-_time){
          BZ._setTimeout(()=>{
            _findDom(p,_bkFun,_time)
          },10)
        }else{
          _bkFun(o)
        }
      }
    }

    function _doTrigger(a,_fun,_bkFun){
      _domActionTask._trigger(a,function(r){
        if(_fun){
          return _fun(r)
        }
        if(_domActionTask.as.length&&r._type==4){
          _timer=0
          BZ._setTimeout(function(){
            _doIt(vs,_bkFun)
          },500)
        }else{
          if(_inRecording){
            return BZ._setTimeout(function(){
              BZ._triggerSetStatus("record")
              BZ._setTimeout(function(){
                r._customizeInputAction={
                  _element: {},
                  _type: 1,
                  _orgPath:d,
                  _action: "change",
                  _value: vv,
                  _time: Date.now(),
                  _tmpUrl: location.href
                };
                _bkFun(r)
              },100)
            },100)
          }else if(r._type<3&&_timer<_maxTime){
            _domActionTask.as.unshift(a)
            _timer+=500
            return BZ._setTimeout(function(){
              _doIt(vs,_bkFun)
            },500)
          }
          r.a=a
          _bkFun(r)
        }
      })
    }
  },
  _retrieveWordsInFormat:function(w,f){
    var vs=f.split(/[^\$0-9]+/),
        fs=f.split(/\$[0-9]+/),ws=[]
    for(var i=0;i<fs.length;i++){
      f=fs[i]
      if(f){
        var j=w.indexOf(f)
        ws.push(w.substring(0,j))
        w=w.substring(j+f.length)
      }
    }
    if(ws.length){
      if(w){
        ws.push(w)
      }
      return ws
    }else{
      return [w]
    }
  },
  _doComment:function(_data){
    _domActionTask._setErrorPos({},"_element","_actionDetailsGeneral");
    var _dom=_domActionTask._findElement(_data);
    
    
    if(_tipHandler._showItem(_data)){
      return {_type:_taskInfo._type._success};
    }else{
      return {_type:_taskInfo._type._failed};
    }
  },
  _getJsonAfterIgnore:function(d,_ignoreKeys,_ignoreValues,_nullValue,_emptyValue){
    _ignoreKeys=(_ignoreKeys||"").trim();
    _ignoreValues=(_ignoreValues||"").trim();
    
    if(d.constructor==Array || d.constructor==Object){
      for(var k in d){
        if(!_ignoreKeys || !k.match(_ignoreKeys)){
          var v=_domActionTask._getJsonAfterIgnore(d[k],_ignoreKeys,_ignoreValues,_nullValue,_emptyValue);
          if(_emptyValue && v===""){
            delete d[k];
          }else if(_nullValue && v===null){
            delete d[k];
          }else if(v && v.constructor!=Object && v.constructor!=Array){
            v=v.toString();
            if(_ignoreValues && v.match(_ignoreValues)){
              delete d[k];
            }else{
              d[k]=v;
            }
          }else{
            d[k]=v;
          }
        }else{
          delete d[k]
        }
      }
    }
    return d;
  },
  _compareWithDataExpection:function(d,o,_force){
    var _result={_type:_taskInfo._type._success,_msg:""};
    _domActionTask._setErrorPos(_result,"_expection","_actionDetailsGeneral");
    let vs=(d.expection||"").split("\n");
    vs=vs.map(x=>{
      if(_Util._hasCode(x)){
        return _eval._exeCode(x)
      }
      return x
    }).filter(x=>x!==undefined&&x!==null&&x!==""&&x!="bz-skip");
    var _text=$util.getElementText(o)
    var _inputs=_cssHandler._findAllInputs(d.e)
    _inputs&&_inputs.forEach(u=>{
      vs.find((x,j)=>{
        if(x==u.value){
          vs.splice(j,1)
          return 1
        }
      })
    })
    
    for(var i=0;i<vs.length;i++){
      var v=vs[i],vv=v;

      try{
        if(!vv&&vv!==0&&vv!==false){
          continue
        }else if(["bz-skip","bz-ignore"].includes(vv)){
          
          continue
        }else if(v=="bz-stop"){
          _result._bzStop=1
          break;
        }
        if(!_text.includes(vv)){
          _result._type=_taskInfo._type._failed;

          _result._msg=_bzMessage._task.UnMatch+": \n\n"+v+` (${vv})`;
          _result._errSou=_taskInfo._errSou._exp;
          break;
        }
      }catch(e){
        _result._type=_taskInfo._type._failed;
        _result._msg+=e.message+" ("+v+")\n";
        _result._errSou=_taskInfo._errSou._exp;
        break;
      }
    }
    if(_force && _result._type!==_taskInfo._type._success){
      alert(_result._msg)
    }
    return _result;
  },
  _extractDataByJs:function(_data,_fun,$parameter,$test,$module,$loop){
    $parameter=$parameter||window.$parameter
    $test=$test||window.$test
    $module=$module||window.$module
    $loop=$loop||window.$loop
    let $element=window.$element

    if(_data.script){
      var element;
      if(_data.element){
        _domActionTask._setErrorPos({},"_element","_actionDetailsGeneral");
        element = _domActionTask._findElement(_data);
      }
      var s=_data.script.trim();
      if(s[s.length-1]==";"){
        s=s.substring(0,s.length-1);
      }

      _domActionTask._exeScript(s,0,$element,function(v){
        _fun({
          _type:v?_taskInfo._type._success:_taskInfo._type._failed,
          _extractData:v
        })
      })
    }else{
      _fun({
        _type:_taskInfo._type._success
      });
    }
  },
  /*
  var data=[
    'DIV:Contains({{$parameter.name1}})',
    'DIV:Contains({{$util.findDom($parameter.name2)}})',
    'DIV:Contains({{$util.findDom($parameter.name3 + $parameter.value1)}})',
    'DIV:Contains({{$util.findDom($parameter.name4 + " "+$parameter.value2)}})',
    'DIV:Contains({{$util.findDom($parameter.name5 + $parameter.value3)}})',
    'DIV:Contains({{$util.findDom($parameter.name11) + $util.findDom($parameter.value7)}})',
    'DIV:Contains({{$util.findDom($parameter.name12) + $parameter.value8}}',
    'DIV:Contains({{$parameter.value10+$util.findDom($parameter.name14)}}',
    'DIV:Contains($parameter.name6)',
    'DIV:Contains($util.findDom($parameter.name7))',
    'DIV:Contains($util.findDom($parameter.name8 + $parameter.value4))',
    'DIV:Contains($util.findDom($parameter.name9 + " "+$parameter.value5))',
    'DIV:Contains($util.findDom($parameter.name10 + $parameter.value6))',
    'DIV:Contains($util.findDom($parameter.name13) + $util.findDom($parameter.value9))',
    'DIV:Contains($util.findDom($parameter.value11+$util.findDom($parameter.name15)))',
    '$util.findDom($parameter.value12+$util.findDom($parameter.name16))',
    '$parameter["lws-ok"]',
  ]
  data.forEach(x=>{
    console.log(_domActionTask._retrieveBindDataFromString(x))
  })
  */
  _retrieveBindDataFromString:function(w){
    // w=w.match(_IDE._insertJSOnlyRegex)
    w=w.match(/\$(project|module|test|loop|data|group|action|parameter|result|element)((\.[^\s\)\]\}\,\;\:\!\=\?\>\<\.\^\%\&\|\@\"\'\+\-\*\/]+)|\[[^\]]+\])+(\(.+\))?/g)
    if(w){
      w=w.map(x=>{
        return x.replace(/\)/,"").replace(/[\"\']$/,"")
      })
      w=[...new Set(w)]
    }
    return w
  },
  // _getCurDataExpress:function(ss){
  //   if(ss){
  //     let s=_domActionTask._retrieveBindDataFromString(ss);
  //     if(s){
  //       s.forEach((v,i)=>{
  //         let vv
  //         try{
  //           eval("vv="+v)
  //           s[i]=v+" = "+JSON.stringify(vv)
  //         }catch(e){
  //           s[i]=v+" ("+_bzMessage._common._error+": "+e.message+")"
  //         }
  //       })
  //       return s.join("\n")
  //     }
  //   }
  //   return ss
  // },
  /*
  _maskContent:function(_content,_empty){
    if(_content.constructor==String){
      var _attrs=_IDE._data._curVersion.setting.content.ignore.attrs;
      var _filter=_IDE._data._curVersion.setting.content.filter;
      if(_attrs.cd && _filter.cd){
        _content=_glossaryHandler._filterDate(_content,_filter.cd,_empty);
      }
      if(_attrs.ct && _filter.ct){
        _content=_glossaryHandler._filterTime(_content,_filter.ct,_empty);
      }
      if(_attrs.ci && _filter.ci){
        _content=_glossaryHandler._filterData("ID",_content,_filter.ci,_empty);
      }
    }
    return _content;
  },
  */
  _prepareValidation:function(){
    var ts=[];
    while(true && _domActionTask._taskQueue){
      var t=_domActionTask._taskQueue.shift();
      if(!t){
        break;
      }
      ts.push(t);
      if(t.code){
        break;
      }
      if(t.type==0 && t.method==0&&t.element){
        try{
          var dom=_domActionTask._findElement(t);
          if(dom){
            t._preDom={
              _html:_calcMD5(dom.outerHTML)
            };
          }
        }catch(e){}
      }else if(t.type==1){
        break;
      }
    }
    for(var i=ts.length-1;i>=0;i--){
      _domActionTask._taskQueue.unshift(ts[i]);
    }
  },
  _setErrorPos:function(_result,_value,_key){
    if(bzTwComm._isIDE()){
      _ideTask._setErrorPos(_result,_value,_key);
    }else{
      this._errorPos={_value:_value,_key:_key}
    }
  }
};window._domRecorder={
  _uploadFileTypes:["avi","bat", "css", "docx", "epub", "gif", "html", "jpg", "js", "json", "odt","ogv","pdf", "png", "rtf", "sh", "txt", "zip"],
  _tmpPath:[],
  _curAPI:0,
  _listenEvents:{
    change: "1",
    dblclick: "1",
    dragDrop: "1",
    click: "1"
  },
  unTmpClass:new Set(),
  _monitorList:[],
  _start:function(){
    this._lastStep=null;
    _domRecorder._setEventListenerOnAllDoms();
    _domRecorder._handleFileInput()
    // this._generateAIValidation([document.body],1)
  },
  _end:function(){
    _ideDataBind._data._inSelectFillField=0
    // _elementMonitor._handleMonitor();
    // _elementMonitor._close();
    _domRecorder._closeObserver();
    _domRecorder._removeEventListener();
    _domRecorder._setBackPopMsg();
    BZ._recording=0;
  },
  _observerTime:Date.now(),
  _observer:new MutationObserver(function(_mutations) {
    let _hasNew;
    if(_mutations.find(_mutation=>{
      let a=_mutation.addedNodes[0]
      
      return a&&a.nodeType==1&&!_domRecorder._isBZElement(a)
    })){
      if(_domRecorder._clickInputStep){
        _domRecorder._createRecordAction(_domRecorder._clickInputStep,1)
        _domRecorder._clickInputStep=0
      }
      clearTimeout(_domRecorder._newInsertTrigger);
      _domRecorder._newInsertTrigger=setTimeout(function(){
        _domRecorder._removeEventListener();
        _domRecorder._setEventListenerOnAllDoms();
      },10);
    }
  }),
  _isBZElement:function(t){
    return t&&($(t).hasClass("BZIgnore")||$(".BZIgnore").find(t).length)
  },
  _handleFileInput:function(){
    $("input[type=file]").on("click",function(e){
      if(BZ._isRecording()){
        bzTwComm._postToIDE({scope:"_domRecorder",fun:"_setClickFileInput"});
        e.stopPropagation()
        e.preventDefault()
        _domRecorder._selectUploadFileOption(this)
      }else if(BZ._isPlaying()){
        e.stopPropagation()
        e.preventDefault()
      }
    })
  },
  _selectUploadFileOption:function(e){
    window._uiSwitch=_CtrlDriver._buildProxy({_uploadFileFrom:"std"});
    
    let fs=_ideDataManagement._getCurFileData()
    
    if(fs.length){
      _uiSwitch._uploadFileFrom="_exist"
    }

    _Util._confirmMessage({
      _tag:"div",
      _attr:{
        style:"flex-direction: column;display: flex;line-height: 30px;height:150px;font-size:15px;"
      },
      _items:[
        {
          _tag:"div",
          _text:function(){
            return _bzMessage._action._ifUploadFile
          }
        },
        //exist file data
        {
          _if:function(){
            return fs.length
          },
          _tag:"label",
          _items:[
            {
              _tag:"input",
              _attr:{
                style:"margin-right:10px",
                type:"radio",
                value:"_exist"
              },
              _dataModel:{_data:_uiSwitch,_key:"_uploadFileFrom"}
            },
            {
              _text:function(){
                return _bzMessage._action._existFileData
              }
            }
          ]
        },
        {
          _if:function(){
            return _uiSwitch._uploadFileFrom=='_exist'&&fs.length
          },
          _tag:"div",
          _attr:{
            style:"display:flex;"
          },
          _items:[
            {
              _tag:"select",
              _attr:{
                style:"height:25px;width:100%"
              },
              _dataModel:{_data:_uiSwitch,_key:"_uploadUrl"},
              _items:[
                {
                  _tag:"option",
                  _attr:{
                    style:"font-size:13px",
                    value:function(d){
                      return '{{'+d._item+'}}'
                    }
                  },
                  _text:function(d){
                    d=d._item
                    let v=_Util._eval(d)
                    if(v.constructor==Function){
                      v=_ideDataHandler._getOrgDataSettingFromNamePath(d).url
                    }
                    if(v.constructor==String){
                      d=`${d} (${v})`
                    }
                    return d
                  },
                  _dataRepeat:function(){
                    return fs
                  }
                }
              ]
            }
          ]
        },
        //std files
        {
          _tag:"label",
          _items:[
            {
              _tag:"input",
              _attr:{
                style:"margin-right:10px",
                type:"radio",
                value:"std"
              },
              _dataModel:{_data:_uiSwitch,_key:"_uploadFileFrom"}
            },
            {
              _text:function(){
                return _bzMessage._action._uploadInStdFiles
              }
            }
          ]
        },
        {
          _if:function(){
            return _uiSwitch._uploadFileFrom=='std'
          },
          _tag:"div",
          _attr:{
            style:"display:flex;"
          },
          _items:[
            {
              _tag:"select",
              _attr:{
                style:"height:25px;width:100%"
              },
              _dataModel:{_data:_uiSwitch,_key:"_uploadUrl"},
              _items:[
                {
                  _tag:"option",
                  _attr:{
                    style:"font-size:13px",
                    value:function(d){
                      return d._item
                    }
                  },
                  _text:function(d){
                    return d._item
                  },
                  _dataRepeat:function(){
                    let vs=_domRecorder._uploadFileTypes
                    return vs.map(x=>"http:"+SERVER_HOST+'/file/example.'+x)
                  }
                }
              ]
            }
          ]
        },
        //url
        {
          _tag:"label",
          _items:[
            {
              _tag:"input",
              _attr:{
                style:"margin-right:10px",
                type:"radio",
                value:"url"
              },
              _dataModel:{_data:_uiSwitch,_key:"_uploadFileFrom"}
            },
            {
              _text:function(){
                return _bzMessage._action._uploadInUrlFile
              }
            }
          ]
        },
        {
          _if:function(){
            let r=_uiSwitch._uploadFileFrom=='url'
            if(r&&!_uiSwitch._uploadUrl){
              _uiSwitch._uploadUrl="/"+"/"
            }
            return r
          },
          _tag:"div",
          _attr:{
            style:"display:flex;"
          },
          _items:[
            {
              _tag:"input",
              _attr:{
                style:"flex:1;height:25px;"
              },
              _dataModel:{_data:_uiSwitch,_key:"_uploadUrl"}
            }
          ]
        },
        {
          _tag:"label",
          _items:[
            {
              _tag:"input",
              _attr:{
                style:"margin-right:10px",
                type:"radio",
                value:"local"
              },
              _dataModel:{_data:_uiSwitch,_key:"_uploadFileFrom"}
            },
            {
              _text:function(){
                return _bzMessage._action._uploadFromDesk
              }
            }
          ]
        },
        {
          _tag:"hr"
        },
        {
          _if:function(){
            return _uiSwitch._uploadUrl&&_uiSwitch._uploadFileFrom!='local'
          },
          _tag:"div",
          _items:[
            {
              _if:function(){
                return _uiSwitch._uploadUrl&&_uiSwitch._uploadUrl.match(/[.](docx|html|odt|epub|avi|pdf|rtf|zip)$/)
              },
              _tag:"a",
              _attr:{
                style:"cursor:pointer;",
                href:function(){
                  return _uiSwitch._uploadUrl
                },
                target:"_"+"blank"
              },
              _text:function(){
                return _bzMessage._action._reviewByDownload
              }
            },
            {
              _if:function(){
                return _uiSwitch._uploadUrl&&_uiSwitch._uploadUrl.endsWith('.ogv')
              },
              _tag:"video",
              _attr:{
                width:200,
                controls:1,
                style:"margin-top:5px;"
              },
              _items:[
                {
                  _tag:"source",
                  _attr:{
                    src:function(){
                      return _uiSwitch._uploadUrl
                    }
                  },
                  _text:"Your browser does not support HTML video."
                }
              ]
            },
            {
              _if:function(){
                return _uiSwitch._uploadUrl&&_uiSwitch._uploadUrl.match(/[.](png|jpg|gif)$/)
              },
              _tag:"img",
              _attr:{
                onerror:"this.style.display='none'",
                onload:"this.style.display='block'",
                src:function(){
                  return _uiSwitch._uploadUrl
                },
                style:"max-width:50px;max-height:50px;",
                onmouseover:"this.style.position='fixed';this.style.maxWidth='unset';this.style.maxHeight='unset';",
                onmouseout:"this.style.position='unset';this.style.maxWidth='50px';this.style.maxHeight='50px';",
              }
            },
            {
              _if:function(){
                let s=_uiSwitch._uploadUrl
                if(s&&s.match(/[.](bat|js|sh|css|json|txt)$/)){
                  $.get(s,function(d){
                    _uiSwitch._tmpContent=d
                  })
                  return 1
                }
              },
              _tag:"div",
              _attr:{
                style:"line-height:20px;padding:10px 0;"
              },
              _text:function(){
                if(_uiSwitch._uploadUrl.endsWith(".json")){
                  return JSON.stringify(_uiSwitch._tmpContent,0,2)
                }else{
                  return _uiSwitch._tmpContent
                }
              }
            }
          ]
        }
      ]
    },[{
      _title:_bzMessage._method._continue,
      _style:"background-color: #0069FF;color: #FFF;float: right;border: 1px solid #999;border-radius: 6px;padding: 6px 10px;font-size:15px;",
      _click:function(c){
        if(_uiSwitch._uploadFileFrom!="local"&&!_uiSwitch._uploadUrl){
          return alert(_bzMessage._action._missingUploadFile)
        }else if(_uiSwitch._uploadFileFrom=="local"){
          _uiSwitch._uploadUrl=""
          $(e).click()
        }else{
          let _url=_uiSwitch._uploadUrl
          if(_uiSwitch._uploadFileFrom=="_exist"){
            _url=_Util._eval(_url.replace(/[\{\}]/g,""))
          }
          if(_url.constructor==String){
            _Util._setUrlFileToInput(_url,e)
          }else{
            $util.triggerChangeEvent(e,_url,1);
          }
        }
        setTimeout(()=>{
          _uiSwitch._uploadFileFrom=""
        },100)
        c._ctrl._close()
      }
    },{
      _title:_bzMessage._method._cancel,
      _style:"background-color: #FFF;color: #000;float: right;border: 1px solid #999;border-radius: 6px;padding: 6px 10px;font-size:15px;",
      _click:function(c){
        _uiSwitch._uploadFileFrom=0
        _uiSwitch._uploadUrl=0
        
        c._ctrl._close()
      }
    }],0,0,1)
    setTimeout(()=>{
      $(".bz-modal-window").css({height:"480px","font-size":"11px"})
    },20)
  },
  _setClickFileInput:function(){
    _domRecorder._lastClickFileInput=Date.now()
    if(_domRecorder._lastNewActionTime&&_domRecorder._lastClickFileInput-_domRecorder._lastNewActionTime.t<200){
      let as=_IDE._data._curTest._data.actions
      let _idx=as.indexOf(_domRecorder._lastNewActionTime.a)
      
      if(_idx>=0){
        as.splice(_idx,1)
        if(_idx){
          BZ._setHash(_idx-1)
        }
      }
    }
  },
  _setBackPopMsg:function(){
    if(bzTwComm._isExtension()){
      return bzTwComm._postToApp({_fun:"_setBackPopMsg",_scope:"_domRecorder"})
    }
    if(window.BZ){
      if(BZ._documents){
        BZ._documents.each(function(i,w){
        });
      }
    }else{
      _doIt(window)
    }
    function _doIt(w){
      try{
        w.alert=w.BZ_Recording_Alert;
        w.confirm=w.BZ_Recording_Confirm;
        w.prompt=w.BZ_Recording_Prompt;
        
        if(w.BZ_Recording_Onbeforeunload){
          w.onbeforeunload= w.BZ_Recording_Onbeforeunload;
        }
        
        w.BZ_Recording_Alert=w.BZ_Recording_Confirm=w.BZ_Recording_Confirm=0
        
        if(w.XMLHttpRequest.prototype.BZ_Ajax){
          w.eval("window.XMLHttpRequest.prototype.open=window.XMLHttpRequest.prototype.BZ_Ajax");
          w.eval("window.XMLHttpRequest.prototype.send=window.XMLHttpRequest.prototype.BZ_AjaxSend");
          w.eval("window.XMLHttpRequest.prototype.setRequestHeader=window.XMLHttpRequest.prototype.BZ_SetHeader");
        }
      }catch(e){
      }
    }
  },
  _closeObserver:function(){
    try{
      this._observer.disconnect();
    }catch(e){}
    this._monitorList=[];
  },
  _setEventListenerOnAllDoms:function(_inTime){
    if(BZ._autoRecording && BZ._recording){
      _domRecorder._setDomEventListener(document)
      if(!_inTime){
        setTimeout("_domRecorder._setEventListenerOnAllDoms()",100);
      }
      return
    }
    if(!BZ._isRecording()){
      _domRecorder._closeObserver();
      return;
    }
    var w=BZ.TW;
    try{
      BZ._prepareDocument(function(){
        if(BZ._documents){
          //set event listener
          BZ._documents.each(function(i,_document){
            _domRecorder._setDomEventListener(_document)
            if(bzTwComm._isExtension()){
              var os=$("IFRAME");
              os.each(function(i,v){
                if(!v.src.startsWith("http")){
                  _domRecorder._setDomEventListener(v.contentDocument)
                }
              })
            }
          });
        }
      });
      if(!_inTime){
        setTimeout(function(){
          _domRecorder._setEventListenerOnAllDoms()
        },100);
      }
  //    }
    }catch(e){
      
    }
  },
  _setDomEventListener:function(_document){
    if(_document._inListening && (_document.body&&_document._body==_document.body)){
      return;
    }
    if(bzTwComm._isExtension()){
      bzTwComm._postToApp({_fun:"_takeoverPopMsg",_scope:"_domRecorder"})
    }else{
      _domRecorder._takeoverPopMsg(_document.defaultView);
    }
    if(BZ._autoRecording){
    // }else if(curUser._curProject.setting.record.autoAIValidation){
      // _elementMonitor._addObj(_document);
    }else{
      // _elementMonitor._close();
    }
    if(_document.body){
      _document._body=_document.body;
    }

    _domRecorder._monitor(_document);
    $(_document).on("focus","select,input,textarea",_domRecorder._bindFocus);
//    $(_document).find("select,input,textarea").bind("focus",_domRecorder._bindFocus);
    $(_document).find("[contenteditable=true]").bind("blur",_domRecorder._bindContentEditable);
    for(var k in _domRecorder._listenEvents){
      if (k=="click") {
        $(_document).find("*").not("style,script").bind("mousedown",_domRecorder._bindFun);
      }else if (k=="mousedown" && _domRecorder._listenEvents.click) {
        continue;
      }else if (k=="focus") {
        continue;
      }else if(k=="dragDrop"){
        $(_document).find("*").not("style,script").bind("mouseup",_domRecorder._bindFun);
        $(_document).find("*").not("style,script").bind("mousemove",_domRecorder._bindFun);
        if(!_domRecorder._listenEvents.mousedown && !_domRecorder._listenEvents.click){
          $(_document).find("*").bind("mousedown",_domRecorder._bindFun);
        }
        continue;
      }
      if(k=="change"){
        $(_document).find("input,textarea,select").bind(k,_domRecorder._bindFun);
      }else{
        $(_document).find("*").not("style,script").bind(k,_domRecorder._bindFun);
      }
    }
    $(_document).find("*").not("style,script").bind("keyup",_domRecorder._bindFun);
    $(_document).find("*").not("style,script").bind("keydown",_domRecorder._bindKeydown);
    _document._inListening=true;
    /*
    let iframes=$(_document).find("IFRAME")
    if(iframes[0]){
      iframes=iframes.toArray();
      iframes.forEach(function(v){
        if(!v.src){
          _domRecorder._setDomEventListener(v.contentDocument)
        }
      })
    }
    */
  },
  _buildTmpPath:function(o,_last){
    _last=_last||[]
    if(_last[0]==o){
      return _last
    }
    var _tmpPath=[]
    while(o && o.tagName!="BODY"){
      _tmpPath.push(o)
      o=o.parentNode||o.host
    }
    return _tmpPath
  },
  _retrievePath:function(p,x,y,_ignoreTxt){
    var _removedElement=[],_body
    if(p.length){
      delete p[0].bzTxtElement
      _body=p[0].ownerDocument.body
    }else{
      return
    }
    if(!_cssHandler._isInShadowDom(p[0])){
      let _lastPath=p[0].bzTmp
      while(p[0]&&!$(p[0].ownerDocument).find(p[0]).length){
        _removedElement.push(p.shift())
        if(!p.length){
          p=this._lastPaths
          _removedElement=[]
        }
      }
      if(!p[0]){
        return {
          _elementPath:_lastPath,
          W:{
            HH:[],
            LL:{}
          }
        }
      }
    }else{
      while(!p[0].getBoundingClientRect().width){
        p.shift()
      }
    }
    if(!p.length){
      p.push(_body)
    }
    let pp=0;
    if(p[0].tagName=="CANVAS"){
      p[0].bzTxtElement=_TWHandler._getCanvasTextElementByMousePos(p[0],x,y,_ignoreTxt)
      pp=p[0]
    }
    p[0].bzShortCut=0
    p=_cssHandler._findPath(p[0],1,_removedElement.length?2:0);
    if(_removedElement.length){
      var i=p._elementPath.pop();
      if(!$.isNumeric(i)){
        p._elementPath.push(i)
      }
      var e=_cssHandler._findCellElement(_removedElement[0]);
      var i=_removedElement.indexOf(e);
      _removedElement.splice(i+1)
      while(_removedElement.length){
        if(_removedElement[0]==e){
          break
        }
        _removedElement.shift()
      }
      while(_removedElement.length){
        e=_removedElement.pop()
        var d={e:e,oe:e,ps:[],ee:1,_headers:[]};
        _cssHandler._findAttributes(d)
        d=d._result._main
        if(d){
          d=d.join("")
        }else{
          d=e.tagName
        }
        p._elementPath.push(d);
      }
      if(e&&!_cssHandler._isInput(e)){
        var w=_Util._filterTxt($util.getElementText(e))
        if(w){
          p._elementPath[p._elementPath.length-1]+=":Contains("+w+")"
        }
      }
      p._elementPath.push(0)
    }

    return p;
  },
  _takeoverPopMsg:function(w){
    w=w||window
    try{
      var _beforeunload=w.onbeforeunload || (_checkJQueryEvent().beforeunload?_checkJQueryEvent().beforeunload[0].handler:null);
      if((!w.BZ_Recording_Onbeforeunload && _beforeunload) || (w.BZ_Recording_Onbeforeunload_fun && w.BZ_Recording_Onbeforeunload_fun!=_beforeunload)){
        w.BZ_Recording_Onbeforeunload=_beforeunload;
        if(_beforeunload){
          _beforeunload=function(){
            var _msg=w.BZ_Recording_Onbeforeunload();
            if(_msg){
              _domRecorder._curPopMsg={_type:"onbeforeunload",_msg:_msg,_time:Date.now()};
              var r=_domRecorder._curPopMsg._returnValue=_domRecorder._curPopMsg._msg;
              _domRecorder._setPopMsg();
              return r;
            }
          }
          if(w.onbeforeunload){
            w.onbeforeunload=_beforeunload;
          }else{
            _checkJQueryEvent().beforeunload[0].handler=_beforeunload;
          }
        }
        w.BZ_Recording_Onbeforeunload_fun=_beforeunload;
      }
      _TWHandler._takeoverCanvas(w)
      
      if(!w.BZ_Recording_Alert||w.BZ_Recording_Alert==w.alert){
        w.BZ_Recording_Alert=w.alert
        w.alert=function(m){
          _domRecorder._curPopMsg={_type:"alert",_msg:m,_time:Date.now()};
          _domRecorder._setPopMsg();
          w.BZ_Recording_Alert(m);
        }
      }
      if(!w.BZ_Recording_Confirm||w.BZ_Recording_Confirm==w.confirm){
        w.BZ_Recording_Confirm=w.confirm
        w.confirm=function(m){
          _domRecorder._curPopMsg={_type:"confirm",_msg:m,_time:Date.now()};
          var r=_domRecorder._curPopMsg._returnValue=w.BZ_Recording_Confirm(m);
          _domRecorder._setPopMsg();
          return r
        }
      }
      if(!w.BZ_Recording_Prompt||w.BZ_Recording_Prompt==w.prompt){
        w.BZ_Recording_Prompt=w.prompt
        w.prompt=function(m){
          _domRecorder._curPopMsg={_type:"prompt",_msg:m,_time:Date.now()};
          var r=_domRecorder._curPopMsg._returnValue=w.BZ_Recording_Prompt(m);
          _domRecorder._setPopMsg();
          return r
        }
      }
    }catch(e){}
    function _checkJQueryEvent(e){
      try{
        return $["_"+"data"](e,"events") || {};
      }catch(e){}
      return {};
    }
  },
  _setPopMsg:function(_popMsg){
    _popMsg=_popMsg||_domRecorder._curPopMsg;
    _domRecorder._curPopMsg=null;
    if(bzTwComm._isApp()){
      bzTwComm._postToExt({_fun:"_setPopMsg",_args:[_popMsg],_scope:"_domRecorder"});
      bzTwComm._postToIDE({_fun:"_setPopInfo",_args:[_popMsg],_scope:"_domRecorder"});
    }else if(!bzTwComm._isIDE()){
      _domRecorder._curPopMsg=_popMsg;
    }
  },
  _showSetAlert:function(v){
    _Util._confirmMessage({
      _tag:"div",
      _data:v,
      _items:[
        {
          _tag:"div",_attr:{"class":"input-group"},
          _items:[
            {
              _tag:"div",_attr:{"class":"input-group-addon"},
              _items:[
                {
                  _tag:"label",
                  _text:"_bzMessage._action._popType"
                }
              ]
            },
            {
              _tag:"select",
              _attr:{
                "disabled":"!BZ._isCheckout()",
                "class":"form-control",
              },
              _dataModel:"_data.popType",
              _items:[
                {
                 _tag:"option",
                  _attr:{
                    value:"_data._item"
                  },
                  _text:"_data._item",
                  _dataRepeat:["","alert","confirm","prompt","onbeforeunload"]
                }
              ]
            }
          ]
        },
        //Compare
        {
          _tag:"div",_attr:{"class":"input-group"},
          _items:[
            {
              _tag:"div",_attr:{"class":"input-group-addon"},
              _items:[
                {
                  _tag:"label",_text:"_bzMessage._action._compare"
                }
              ]
            },
            {
              _tag:"select",
              _attr:{
                "disabled":"!BZ._isCheckout()",
                "class":"form-control"
              },
              _items:[
                {
                  _tag:"option",
                  _attr:{
                    value:"_data._item"
                  },
                  _text:function(d){
                    return d._item.includes("clude")?_bzMessage._common[d._item]:d._item;
                  },
                  _dataRepeat:["==",">",">=","<","<=","!=","regex","include","exclude"]
                }
              ],
              _dataModel:"_data.compareMark"
            }
          ]
        },
        {
          _tag:"div",
          _attr:{
            "class":"input-group"
          },
          _items:[
            {
              _tag:"div",_attr:{"class":"input-group-addon"},
              _items:[
                {
                  _tag:"label",
                  _text:"_bzMessage._action._expection"
                },
              ]
            },
            //expection value
            {
              _tag:"input",
              _attr:{
                "class":"form-control",
                placeholder:"_bzMessage._action._dataSizeWarning"
              },
              _dataModel:"_data.expection"
            }
          ]
        },
        //return value
        {
          _if:function(d){
            return d.popType=='confirm' || d.popType=='prompt';
          },
          _tag:"div",_attr:{"class":"input-group"},
          _items:[
            {
              _tag:"div",_attr:{"class":"input-group-addon"},
              _items:[
                {
                  _tag:"label",
                  _text:"_bzMessage._action._returnValue"
                }
              ]
            },
            {
              _tag:"input",
              _attr:{
                "disabled":"!BZ._isCheckout()",
                type:"text",
                "class":"form-control"
              },
              _dataModel:"_data.returnValue"
            }
          ]
        }
      ]
    },[{
      _title:_bzMessage._method._close,
      _click:function(c){
        c._ctrl._close()
        _ideTestManagement._save()
      }
    }],0,0,1,0,1)
  },
  _isIgnoreClickElement:function(e){
    if(_cssHandler._isCustomizeInputCss(e)){
      return 
    }
    return ["INPUT","TEXTAREA","SELECT"].includes(e.tagName) && !["reset","submit","button","image"].includes(e.type)
  },
  _monitorSetInputActions:{
    _mergeForSetAction:function(e,a){
      let _this=this
      if(_this._isInMonitoredScope(e)&&(a._type=="click"||a._type=="change")){
        let as=_this._curMonitorElement._actions
        if(as.length==2){
          if(a._type!="click"||as[1]._type=="click"){
            _setLastAction(a)
            return
          }
        }else if(as.length>2){
          _setLastAction(a)
          return
        }
        as.push(a)
        if(a._type=="click"){
          clearTimeout(_domRecorder._mergeSetActionTime)
          _domRecorder._mergeSetActionTime=setTimeout(()=>{
            _doIt(as)
          },500)
        }
      }else{
        _setLastAction(a)
      }
            
      function _doIt(as){
        if(_Util._isHidden(_this._curMonitorElement._element)){
          let _targetElement=as[0]._element
          if((_targetElement.innerText||_targetElement.value||"").includes(a._txt)){
            as={
              _actions:as,
              _data:{
                _value:a._txt
              }
            }
            
            if(_IDE._innerWin._data._dataBind._showDataBind&&_targetElement){
              let p=_ideDataBind._getBindData(_targetElement)
              if(p){
                if(p.includes("$")){
                  p="{{"+p+"}}"
                  as._data._inputPath=_cssHandler._findInputPath(_targetElement)
                }
                as._data._name=p
              }
            }
            if(!bzTwComm._isExtension()){
              _ideActionManagement._mergeToSetAction(as);
            }else{
              bzTwComm._postToIDE({_args: [as],_scope:"_ideActionManagement",_fun:"_mergeToSetAction"});
            }
          }
          _this._lastAction=_this._curMonitorElement=0
          _Util._clearPreEventElements()
        }else{
          _setLastAction(a)
        }
      }

      function _setLastAction(a,_noclear){
        if(a._type=="click"){
          _this._lastAction=a
        }else{
          if(Date.now()-_domRecorder._monitorSetInputActions._chkTime>300){
            _Util._clearPreEventElements()
          }
          _this._lastAction=0
        }
        _this._curMonitorElement=0
      }
    },
    _chkElementUpdate:function(e){
      console.log("_chkElementUpdate")
      if(this._isInMonitoredScope(e)){
        return
      }

      let ds=_Util._getDiffAfterTriggerEvent(1,1)
      this._chkTime=Date.now()
      if(ds.includes(e)&&this._lastAction){
        this._curMonitorElement={
          _element:e,
          _diffList:ds,
          _actions:[this._lastAction]
        }
      }else{
        this._curMonitorElement=0
        this._lastAction=0
      }
    },
    _isInMonitoredScope:function(e){
      return this._curMonitorElement&&this._curMonitorElement._diffList.includes(e)
    }
  },
  _recordEvent:function(_action,_value){
    if(_ideDataBind._data._inSelectFillField){
      return
    }
    var _element=_action.currentTarget;
    if(["mousedown"].includes(_action.type)){
      _domRecorder._monitorSetInputActions._chkElementUpdate(_element)
    }

    if(_action.type=="change"){
      _element=_action.target;
      if(_element.type=="hidden"){
        return;
      }
    }
    _Util._removeLinkTarget(_element);

    if(_cssHandler._isInput(_element) && !_element.readOnly && !$("#BZ_Win").find(_element).length && "focusin"==_action.type){
      // setTimeout(function(){
        // _ideDataBind._showMe(_element)
      // },100);
      return
    }else if(_Util._isInContentEditable(_element) && !$("#BZ_Win").find(_element).length && "mousedown"==_action.type){
      // setTimeout(function(){
        // _ideDataBind._showMe(_element)
      // },100);
    }else if(!$(BZ.TW.document).find(".BZIgnore").find(_element).length){
      if(_action.type=="blur" && !_domRecorder._typed){
        return;
      }
    }
    //ignore tab on input/select
    var _keyCode=_Util._checkKeycode(_action)
    if(_keyCode==9 && ["A","BUTTON","INPUT","SELECT","TEXTAREA"].includes(_element.tagName)){
      return
    }else if([40,38,39,37].includes(_keyCode) && ["SELECT","TEXTAREA"].includes(_element.tagName)){
      return
    }else if(13==_keyCode && ["TEXTAREA"].includes(_element.tagName)){
      return 
    }
    var _paths;
    if(!this._lastPaths || this._lastPaths[0]!=_element){
      this._lastPaths=_paths=_domRecorder._buildTmpPath(_element);
    }else{
      _paths=this._lastPaths
    }

    if(["click","dblclick","mousedown"].includes(_action.type) && this._isIgnoreClickElement(_element)){
      if(_element.type=="file"){
        console.log("click file")
      }else if(_element.tagName!="SELECT"){
        this._lastStep._action=_action.type=="mousedown"?"click":_action.type;
        this._clickInputStep=this._lastStep
      }
      this._lastStep=0
      return;
    }

    
    var _step={
      _element:_element,
      _type:_ideActionData._type._triggerEvent,
      _paths:_paths,
      _action:_action.type,
      _ctrl:_action.ctrlKey,
      _alt:_action.altKey,
      _code:_keyCode,
      _char:_Util._checkCharcode(_action),
      _shift:_action.shiftKey,
      _value:_value,
      _button:_action.buttons||_action.button,
      _pageX:_action.pageX,
      _pageY:_action.pageY,
      _time:Date.now(),
      _tmpUrl:BZ.TW.location.href,
      _domXY:_Util._getDomXY(_element),
      _keyName:_action.key
    };

    if(_action.type=="mouseup"){
      if(!this._lastStep){
      }else if(this._listenEvents.dragDrop && this._lastStep._inDragdrop){
        _step._element=this._lastStep._element;
        _step._paths=this._lastStep._paths;
        _step._action="dragdrop";
        _step._orgPath=this._lastStep._orgPath;
        _step._tmpUrl=this._lastStep._tmpUrl;
        _step._startPos=_domRecorder._mousedownStep._domXY
        _domRecorder._createRecordAction(_step);
        this._lastStep=_step
      }else if(this._lastStep._action=="mousemove"){
        this._lastStep._action="click";
        _domRecorder._createRecordAction(this._lastStep);
        this._lastStep=0
      }
      return;
    }
    var _this=this;
    if (_action.type=="mousedown") {
      this._lastStep=_domRecorder._mousedownStep=_step;
      _step._orgPath=_domRecorder._retrievePath(_step._paths,_action.pageX,_action.pageY)
      return;
    }else if(_action.type=="mousemove"){
      if(!_step._button){
        if(this._lastStep && this._lastStep._action=="mousedown"){
          if(this._lastStep._element.draggable && (Math.abs(_step._pageX-this._lastStep._pageX)>10||Math.abs(_step._pageY-this._lastStep._pageY)>10)){
            this._lastStep._action="dragdrop";
            this._lastStep._pageX=_action.clientX
            this._lastStep._pageY=_action.clientY
            this._lastStep._targetElement=_Util._getElementByXY(this._lastStep._element.ownerDocument,_action.clientX,_action.clientY,this._lastStep._element)
            if(this._lastStep._targetElement){
              this._lastStep._targetElement=_cssHandler._findPath(this._lastStep._targetElement)
            }
          }else{
            this._lastStep._action="click";
          }
          _domRecorder._createRecordAction(this._lastStep);
          this._lastStep=0
        }else{
          this._lastStep=_step;
        }
      }else{
        if(this._lastStep && this._lastStep._element==_step._element && (this._lastStep._domXY.x!=_step._domXY.x || this._lastStep._domXY.y!=_step._domXY.y)){
          this._lastStep._inDragdrop=1
        }
      }
      return;
    }else if(_action.type=="click"){
      if(!this._lastStep){
        return
      }else if(this._lastStep._action=="dragdrop"){
        this._lastStep=0;
        return;
      }
      
      if(this._lastStep._action!=="mousedown"){
        return _domRecorder._createRecordAction(_step);
        /*
        var _tmpClick=_step;
        return setTimeout(function(){
          _domRecorder._createRecordAction(_tmpClick);
        },100)
        */
      }else if(this._lastStep && this._lastStep._action=="mousedown"){
        if((_action.pageX||_action.pageY)&&(Math.abs(_action.pageX-_domRecorder._lastStep._pageX)>50||Math.abs(_action.pageY-_domRecorder._lastStep._pageY)>50)){
          this._lastStep._action="dragdrop"
          this._lastStep._pageX=_action.pageX
          this._lastStep._pageY=_action.pageY
          if(this._lastStep._element.tagName=="CANVAS"){
            let _ignoreTxt=_descAnalysis._retrieveTextForElementPathItem(this._lastStep._orgPath._elementPath)
            let ee=_domRecorder._retrievePath(_step._paths,_action.pageX,_action.pageY,_ignoreTxt)
            if(ee){
              this._lastStep._targetElement=ee._elementPath
            }
          }
        }else{
          this._lastStep._action="click"
        }
        _domRecorder._createRecordAction(_domRecorder._lastStep);
        this._lastStep=0;
        return;
      }
    }
    if(!(this._lastStep && this._lastStep._action=="mousedown" && _step._element!=this._lastStep._element)){
      this._lastStep=_step;
    }
    _domRecorder._createRecordAction(_step);
  },
  _setPopInfo:function(_popMsg,a){
    if(!_popMsg){
      return;
    }
    a=a||_IDE._data._curAction;
    if(a){
      if(!a.event.popType){
        a.event.popType=_popMsg._type;
        a.expection=_popMsg._msg;
        a.event.returnValue=_popMsg._returnValue;
        a.event.popFollow=""
      }else{
        if(!a.event.alerts){
          a.event.alerts=[]
          a.event.alerts.push({
            popType:a.event.popType,
            expection:a.expection,
            returnValue:a.event.returnValue,
            popFollow:""
          })
        }
        a.event.alerts.push({
          popType:_popMsg._type,
          expection:_popMsg._msg,
          returnValue:_popMsg._returnValue,
          popFollow:""
        })
      }
    }
  },
  _addData:function(d){
    if(_isIgnoreElement(d._element,d._action)){
      return
    }
    if(!BZ._autoRecording && _domRecorder._lastData && _domRecorder._lastData._element==d._element && _domRecorder._lastData._action==d._action && d._action=="click"){
      return
    }else{
      _domRecorder._lastData={_element:d._element,_action:d._action}
    }
    if(d._action=="change"){
      _domRecorder._typed=0;
    }
    if(!d._orgPath){
      d._orgPath=_domRecorder._retrievePath(d._paths,d._pageX,d._pageY);
      if(!d._orgPath){
        return
      }
    }

    var a={
      "type":d._type,
      "element":d._orgPath._elementPath||d._orgPath.element,
      // qpath:_Util._getQuickPath(d._element),
      // css:d._orgPath.W||d._orgPath.css,
      event:{
        type:["change","focus","blur"].indexOf(d._action)>=0?d._action:d._action.indexOf("key")==0?"key":"mouse",
        ctrl:d._ctrl,
        alt:d._alt,
        shift:d._shift,
        button:d._button,
        x:d._pageX,
        y:d._pageY,
        keyCode:d._code,
        charCode:d._char,
        _customize:d._element._customize,
        value:BZ._autoRecording?d._value:_domActionTask._curValueDataBind||d._value
      },
      _tmpUrl:d._tmpUrl,
      _inUpload:d._inUpload,
      _uploadFile:d._uploadFile,
      _uploadUrl:d._uploadUrl
    };
    if(_isComElement(a.element)){
      let tt=_getComTarget(d._element)
      let tw=_descAnalysis._retrieveTextForElementPathItem(a.element)
      a.event.type="change"
      if(!tt){
        a.event.value="{{$parameter."+_glossaryHandler._getVariableName(tw)+"}}"
      }else if(tt.type=="radio"){
        a.event.value=tw
      }else{
        a.event.value="true"
      }
    }else if(d._action=="click"){
      // _ideDataBind._bindDataOnElement(a,"element")
    }
    //It is in blank IFRAME
    if(d._element.ownerDocument!==document&&!a.element[1].includes("IFRAME")){
      a.element.splice(1,0,"IFRAME:blank("+_identifyIFrameHandler._getBlankIFrameID(d._element.ownerDocument.defaultView)+")")
    }
    
    if(d._element.bzTxtElement){
      a.offset=d._element.bzTxtElement.offset
      delete d._element.bzTxtElement
    }
    
    if(d._targetElement){
      a.event.element=d._targetElement
      if(a.offset){
        a.event.offset=a.offset
        delete a.offset//={x:0,y:0,origin:"mc"}
      }
    }
    if(d._action=="dragdrop"&&d._startPos&&d._domXY){
      a.event.way=Math.abs(d._startPos.x-d._domXY.x)>Math.abs(d._startPos.y-d._domXY.y)?"H":"V"
    }
    if(!BZ._autoRecording){
      _domActionTask._curValueDataBind=0;
    }
    _domRecorder._setPopInfo(this._curPopMsg,a);
    this._curPopMsg=0;
    
    if(d._action=="change" && d._element.type!="file"){
      a.event.autoBlur="on";
    }else if(d._action=="keyup"){
      a.event.action="group";
      a.event.keyName=d._keyName
      delete a.event.value;
    }
    if(d._button==2){
      a.event.action="click";
    }else if (!["keyup","change","focus","blur"].includes(d._action)) {
      a.event.action=d._action;
    }
    
    if(d._element.tagName=="CANVAS"&&a.event.action=="click"&&!_descAnalysis._retrieveTextForElementPathItem(a.element)){
      
    }
    
    // _ideDataBind._bindDataOnElement(a,"element")
    _domRecorder._lastAction=a;
    _domRecorder._lastElement=d._element;
    _domRecorder._clickInputStep=0
    
    // if(!BZ._autoRecording && a.event.type!="change"){
      // _ideDataBind._hideMe()
    // }
    if(this._lastStep&&d._action=="change"){
      if(this._lastStep._action!="mousedown"){
        this._lastStep=0
      }
    }else{
      this._lastStep=0
    }
    if(_IDE._data._setting.autoMergeToSetValue){
      a._mergeId=Date.now()
      _domRecorder._monitorSetInputActions._mergeForSetAction(d._element,{
        _action:a,
        _element:d._element,
        _type:d._action,
        _txt:d._element.innerText||_descAnalysis._retrieveTextForElementPathItem(d._element),
        _elementScope:_cssHandler._getElementScope(d._element)
      })
    }
    if(BZ._autoRecording){
      BZ._storeData(a)
    }else if(!bzTwComm._isExtension()){
      _ideActionManagement._addItem(a);
    }else{
      //Call background to set back recording action
      _domRecorder._sendData(a)
    }
    _timingInfo._setTmpInfo([_ideActionManagement._getAutoDescription(a,1)])
    setTimeout(function(){
      _descAnalysis._clearTmpPath(1);
    },200)

    function _getComTarget(o){
      while(o){
        let os=$(o).find("INPUT")
        if(os.length){
          if(os.length>1){
            return
          }else{
            return os[0]
          }
        }else if(o.tagName=="BODY"){
          return
        }
        o=o.parentNode
      }
    }

    function _isComElement(p){
      return p[1][0]==":"&&!p[1].match(/^\:(input|text|Contains|RowCol|equal)/i)
    }

    function _isIgnoreElement(e,_action){
      if(_action=="click"&&e){
        if(e.tagName!="LABEL"&&e.tagName!="INPUT"){
          e=_Util._getParentNode(e,"LABEL")
        }
        
        if(e&&e.tagName=="LABEL"){
          e=$(e).find("input")[0]
        }

        if(e&&e.tagName=="INPUT"&&e.getBoundingClientRect().width&&(["checkbox","radio"].includes(e.type))){
          return 1
        }
      }
    }
  },
  _sendDataList:[],
  _sendData:function(a){
    this._lastData=a;
    BZ._formatInIFramePath(a.element)
    _domRecorder._sendDataList.push({_args:[a,function(){
      _doIt()
    }],_scope:"_ideRecorder",_fun:"_addNewItem"})
    _doIt()
    function _doIt(){
      if(!_domRecorder._waitSendData){
        let o=_domRecorder._sendDataList.shift()
        if(o){
          _domRecorder._waitSendData=1
          bzTwComm._postToIDE(o);
          
          setTimeout(()=>{
            _domRecorder._waitSendData=0
            _doIt()
          },300)
        }
      }
    }
  },
  _isIgnoreEvent:function(d){
    if(_cssHandler._isCustomizeInputCss(d)){
      return 
    }
    var _tagName=d.tagName;
    if(!d.readOnly){
      if((_tagName=="INPUT" && !["button","submit","radio","image"].includes(d.type)) || ["TEXTAREA","SELECT"].includes(_tagName)){
        //ignore click on input event
        return _tagName=="SELECT" || !_cssHandler._getParentSelect(d);
      }
    }
    return _Util._inSelectOption(d)
  },
  _insertPrepareChange:function(){
    if(this._prepareChange){
      var a=this._prepareChange;
      a._time=Date.now()
      this._prepareChange=0;
      this._createRecordAction(a)
      this._lastPrepareChangeElement={_element:a._element,_time:Date.now()}
    }
  },
  _createRecordAction:function(d,_force){
    if(this._lastPrepareChangeElement&&this._lastPrepareChangeElement._element==d._element&&Date.now()-this._lastPrepareChangeElement._time<500){
      if(d._code!=13||(this._lastAction&&this._lastAction.event.type!="change")){
        return
      }
    }
    if(!d || d._action=="focusin"){
      return;
    }
    if(d._action=="blur" && !_domRecorder._typed){
      return;
    }
    if(d._action=="keyup"){
      if(!d._code){
        return;
      }
      if(d._char==0 && ([13,40,38,33,34,9].includes(d._code) || d.code>111)){
        this._insertPrepareChange();
      }else if(_Util._isStdInputElement(d._element)){
        d._action="change"
        d._value=d._element.value;
        if(d._code==13 && !d._value){
          this._insertPrepareChange();
        }else{
          return this._prepareChange=d;
        }
      }else if($(d._element).attr("contenteditable")){
        return;
      }
    }else if(this._prepareChange && d._action._element!=this._prepareChange._element){
      this._insertPrepareChange();
    }else{
      this._prepareChange=0;
    }
    if(d._action=="click" && this._lastStep && this._lastStep._action=="keyup"){
      return;
    }
    if(["change","blur","focusout"].includes(d._action)){
      if(this._lastChangeStep && this._lastChangeStep._element==d._element && d._time-this._lastChangeStep._time<500){
        return;
      }else{
        this._lastChangeStep=d;
      }
    }else{
      this._lastChangeStep=0;
    }
    
    if(!_force&&"click,mousedown,mouseup".includes(d._action)){
      if(this._isIgnoreEvent(d._element)){
        return;
      }
    }else if(d._action=="change" && d._element.tagName=="SELECT"){
      var vs=""
      for(var i=0;i<d._element.selectedOptions.length;i++){
        var o=d._element.selectedOptions[i];
        v=o.textContent || o.text;
        vs+="\n"+v;
      }
      d._value=vs.substring(1);
    }
    var _changeOnFile=d._action=="change" && d._element.tagName=="INPUT" && d._element.type=="file";
    if(_changeOnFile){
      _uploadHandler._inputFileToBase64Obj(d._element.files,function(_result){
        var uf=_uiSwitch._uploadUrl
        d._uploadFile=_result
        _result=JSON.stringify(_result,0,2)
        if(uf||_ideActionManagement._checkFileSize(_result)){
          d._value=uf||("{{"+_result+"}}");
          d._inUpload=1
          d._uploadUrl=uf
          if(uf){
            delete d._uploadFile
          }
          _domRecorder._addData(d);
        }
      })
    }else if(d._action=="change" && d._element.tagName=="INPUT" && d._element.type=="checkbox"){
      if(!d._element.checked){
        d._value=null;
      }
    }else if(["focusout","blur"].includes(d._action) && !_Util._isStdInputElement(d._element) && d._element.contentEditable){
      d._action="change"
    }
    if(!_changeOnFile){
      _domRecorder._addData(d);
    }
  },
  _bindKeydown:function(a){
    if(!a.keyCode){
      return;
    }
    if($(BZ.TW.document).find(".BZIgnore").find(a.target).length){
      return;
    }
    // _elementMonitor._handleMonitor();
    if(_Util._isInContentEditable(a.currentTarget || a.target)){
      _domRecorder._typed=1;
    }
    setTimeout(function(){
      _ideDataBind._filter(a.target)
    },100)
  },
  _bindFun:function(a,b,c){
    if(!BZ._isRecording()){
      return;
    }
    if($(BZ.TW.document).find(".BZIgnore").find(this).length){
      return;
    }else if(!_IDE._data._setting.disableShadowRootRecording&&a.target.shadowRoot&&_Util._hasDeepContent(a.target.shadowRoot)){
      if(!a.target.shadowRoot._inListening){
        a.target.shadowRoot._path=_cssHandler._findPath(a.target)
        _domRecorder._setDomEventListener(a.target.shadowRoot)
      }
      return
    }else if(a.target==this){
      _domRecorder._recordEvent(a,this.value);
    }else if(a.type=="change"){
      _domRecorder._recordEvent(a,a.target.value);
    }

    if(a.type=="mouseup" && a.target==this){
      _domRecorder._removeEventListener();
      _domRecorder._setEventListenerOnAllDoms(1);
    }
  },
  _bindContentEditable:function(a){
    if(!BZ._isRecording() || (!BZ._autoRecording && _bzDomPicker._isPicking() && !_bzDomPicker._isRecording())){
      return;
    }
    if(a.target==this){
      _domRecorder._recordEvent(a,this.innerHTML);
    }
  },
  _bindFocus:function(a){
    if(!BZ._isRecording()){
      return;
    }
    if(a.target==this && !$(BZ.TW.document).find(".BZIgnore").find(this).length){
      _domRecorder._recordEvent(a,this.value);
    }
  },
  _removeEventListener:function(){
    //remove listener
    if(BZ._autoRecording){
      return _domRecorder._removeDomEventListener(document)
    }
    BZ._prepareDocument(function(){
      if(BZ._documents){
        BZ._documents.each(function(i,_document){
          _domRecorder._removeDomEventListener(_document)
        });
        if(!_bzDomPicker._isPicking()&&!_ideDataBind._data._inSelectFillField){
          _bzDomPicker._removeTmpCover();
        }
      }
    });
  },
  _removeDomEventListener:function(_document){
    try{
      _document._inListening=false;
      $(_document).off("focus","select,input,textarea",_domRecorder._bindFocus);
//      $(_document).find("select,input,textarea").unbind("focus",_domRecorder._bindFocus);
      $(_document).find("[contenteditable=true]").unbind("blur",_domRecorder._bindContentEditable);
      
      for(var k in _domRecorder._listenEvents){
        if (k=="click") {
          $(_document).find("*").not("style,script").unbind("mousedown",_domRecorder._bindFun);
        }else if (k=="mousedown" && _domRecorder._listenEvents.click) {
          continue;
        }else if (k=="focus") {
          continue;
        }else if(k=="dragDrop"){
          $(_document).find("*").not("style,script").unbind("mouseup",_domRecorder._bindFun);
          $(_document).find("*").not("style,script").unbind("mousemove",_domRecorder._bindFun);

          if(!_domRecorder._listenEvents.click){
            $(_document).find("*").unbind("mousedown",_domRecorder._bindFun);
          }
          continue;
        }
        if(k=="change"){
          $(_document).find("input,textarea,select").unbind(k,_domRecorder._bindFun);
        }else{
          $(_document).find("*").not("style,script").unbind(k,_domRecorder._bindFun);
        }
      }
      $(_document).find("*").not("style,script").unbind("keyup",_domRecorder._bindFun);
      $(_document).find("*").not("style,script").unbind("keydown",_domRecorder._bindKeydown);
    }catch(e){
      
    }
  },
  _monitor:function(_doc){
    var ds=_domRecorder._monitorList;
    if(!ds.includes(_doc)){
      ds.push(_doc);
      _domRecorder._observer.disconnect();
      for(var i=ds.length-1;i>=0;i--){
        var d=ds[i];
        if(!d.defaultView || d.defaultView.closed || !d.body){
          ds.splice(i,1);
        }else{
          _domRecorder._observer.observe(d.body,{
            childList:true,
            subtree:true,
            characterData: true,
            attributes:true,
            attributeFilter: ['style','class'],
            attributeOldValue:true
          });    
        }
      }
    }
  }
};window._uploadHandler={
  _retrieveBase64ValueFromLink:function(url){
    return url.substring(url.indexOf("base64,")+7); 
  },
  _base64ToBlob:function(o){
      var _sliceSize = 1024;
      var _byteChars = _Util._b64DecodeUnicode(this._retrieveBase64ValueFromLink(o.base64Link));
      var _byteArrays = [];

      for (var _offset = 0, _len = _byteChars.length; _offset < _len; _offset += _sliceSize) {
          var _slice = _byteChars.slice(_offset, _offset + _sliceSize);

          var _byteNumbers = new Array(_slice.length);
          for (var i = 0; i < _slice.length; i++) {
            _byteNumbers[i] = _slice.charCodeAt(i);
          }

          _byteArrays.push(new Uint8Array(_byteNumbers));
      }

      var v = new Blob(_byteArrays, {type:o.type});
      for(var k in o){
        try{
          v[k]=o[k];
        }catch(e){}
      }
      v.$ngfBlobUrl=window.URL.createObjectURL(v);
//      delete v.base64Link;
      return v;
  },
  _inputFileToBase64Obj:function(_files,_funNext,_idx,_result){
    if(!_idx){
      _idx=0;
    }
    if(!_result){
      _result=[];
    }
    if(_files.length<=_idx){
      return _funNext(_result);
    }
    var _file=_files[_idx++];
    var _reader = new FileReader();
    _reader.onload = function (e) {
      var v=e.target.result;
      var o = $.extend(null,_file);
      o.base64Link=e.target.result;
      _result.push(o);
      _uploadHandler._inputFileToBase64Obj(_files,_funNext,_idx,_result);
    }
    _reader.readAsDataURL(_file);
  },
  _buildUploadBold:function(_list){
    var _result=[];
    for(var i=0;i<_list.length;i++){
      var o=_list[i];
      _result.push(this._base64ToBlob(o));
    }
    return _result;
  },
  _setFileValue:function(_input,v){
    if(v.constructor==String){
      v=JSON.parse(v)
    }

    for(var i=0;i<v.length;i++){
      v[i].name=decodeURIComponent(v[i].name.split("?")[0]);
    }

    let a=_uploadHandler._buildUploadBold(v)
    let d = new ClipboardEvent('').clipboardData || new DataTransfer();
    a.forEach((x,i)=>{
      let f=new File([x],v[i].name,{type:v[i].type})
      d.items.add(f);
    })
    _input.files=d.files
    
    
    // let a=_uploadHandler._buildUploadBold(v)
    // let d = new ClipboardEvent('').clipboardData || new DataTransfer();
    // let f=new File(a,v[0].name,{type:v[0].type})
    // d.items.add(f);
    // f=new File(a,v[0].name,{type:v[0].type})
    _input.files=d.files
    
    
  },
  _outputSubmitResult:function(data,_target){
    var w=BZ.TW.open('',_target||"_"+"self");
    w.location.reload();
    w.document.write(data);
  },
  _overWriteSubmitForm:function(_field){
    if(_field.name){
      var _form=_uploadHandler._curForm=_Util._getParentNode(_field,"FORM");
      if(_form && !_form.BZ_handled){
        _form.BZ_handled=true;
        $(_form).on("submit",function(){
          this.submit();
        });
        _form.submit=function(){
          var ps=$(this).serializeArray();
          
          var formData = new FormData();
          
          for(var i=0;i<ps.length;i++){
            var p=ps[i];
            formData.append(p.name, p.value);
          }
           
          var fs=BZ._documents.find("div[type='file']")
          for(var i=0;i<fs.length;i++){
            var f=fs[i];
            for(var n=0;n<f.files.length;n++){
              formData.append($(f).attr("name"), f.files[n],f.files[n].name);
            }
          }
          var _this=this;
          $.ajax({
            url:this.action,
            type:this.method,
            data:formData,
            processData: false,
            contentType: false,
            success: function(data){
              _uploadHandler._outputSubmitResult(data,_this.target);
            },
            error:function(data){
              _uploadHandler._outputSubmitResult(data,_this.target);
            }
          });
          return true;
        }
        
        
      }
    }
  },
  _submitCurForm:function(){
    _uploadHandler._curForm.submit();
  },
  //p:path
  _keepChangeFileFun:function(p){
    //p[0]="window.document";
    if(window.jQuery){
      var o=$(p)[0];
      if(o && o.type=="file" && jQuery["_"+"data"](o).events && jQuery["_"+"data"](o).events.change){
        this._fileChangeFun=jQuery["_"+"data"](o).events.change;
      }
    }
  },
  _exeKeepChangeFileFun:function(p){
    p=_Util._getElementByQuickPath(p)
//    console.log(p)
//    p.dispatchEvent(new Event("load"));
    p.dispatchEvent(new Event("change",{bubbles:true}));
  },
  _getProjectFiles:function(){
    return _IDE._data._curVersion.setting.defaultData.filter(x=>x.type=="r"&&x.value.url&&x.value.url.includes("/"+"/"+location.host))
  },
  _findDataByFileName:function(v){
    let fs=_uploadHandler._getProjectFiles();
    return (fs.find(x=>x.value.name==v)||{}).name
  },
  _addProjectData:function(d){
    let n=_glossaryHandler._getVariableName(d.name)
    _IDE._data._curVersion.setting.defaultData.push({
      type:"r",
      name:n,
      value:{
        url:d.url,
        type:"file"
      }
    })
    _ideVersionManagement._save()
    return "$project."+n
  },
  _handleUploadFile:function(v,_fun){
    let d=_uploadHandler._findDataByFileName(v.name);
    if(d){
      return _fun("$project."+d)
    }
    let fs=_uploadHandler._getProjectFiles();
    if(fs.length>10){
      return alert(_bzMessage._action._limitFileCount)
    }
    _requestHandler._callService({
      _data:{
        method:"POST",
        url:"/api/projects/"+BZ._data._curProject.code+"/uploadFileData/",
        data:v
      },
      _success:function(x){
        _fun(_uploadHandler._addProjectData(x.result))
      }
    });
  },
  _askHandleFile:function(a,_fun){
    let v=a._uploadFile[0]
    v.file=v.base64Link
    delete v.base64Link
    delete a._uploadFile
    _Util._confirmMessage({
      _tag:"div",
      _items:[
        {
          _tag:"label",
          _text:"_bzMessage._action._confirmUploadFileToServer"
        }
      ]
    },[{
      _title:_bzMessage._method._not,
      _class:"btn-secondary",
      _click:function(c){
        if(v.size>6000){
          return alert(_bzMessage._action._tooLargeInScript)
        }
        c._ctrl._close()
      }
    },{
      _title:_bzMessage._method._yes,
      _click:function(c){
        _uploadHandler._handleUploadFile(v,function(n){
          a.event.value=`{{${n}}}`
          $(".row-selected").click()
        })
        c._ctrl._close()
      }
    },{
      _title:_bzMessage._method._cancel,
      _class:"btn-secondary",
      _click:function(c){
        a.event.value=""
        $(".row-selected").click()
        c._ctrl._close()
      }
    }],0,0,1)
  }
};window.$util={
  extendExtensionScript:function(c,_pos){
    let d={bz:1}
    if(_pos=="end"){
      _pos="extendEndScript"
    }else{
      _pos="extendTopScript"
    }
    d[_pos]=`try{${c}}catch(ex){alert(ex.message)}`
    chrome.runtime.sendMessage(_extensionComm._bzExtensionId, d)
  },
  extendExceptionScript:function(c,_pos){
    return $util.extendExtensionScript(c,_pos)
  },
  removeDuplicateData:function(d){
    if(d&&d.constructor==Array){
      let v,_idx=d.length-1;
      while(_idx>=0){
        v=d[_idx]
        for(let i=0;i<_idx;i++){
          if(_Util._isSameObj(d[i],v)){
            d.splice(_idx,1)
            break
          }
        }
        _idx--
      }
    }else if(d && d.constructor==Object){
      for(let k in d){
        _cleanEmptyObj(d[k])
      }
    }
  },
  attachScreenshotToReport:function(v){
    v=v||["BZ.TW.document","BODY",0]
    let _curBack
    $util.takeScreenshot(v,(x)=>{
      $util.attachInfoToReport(x)
      _curBack&&_curBack()
    })
    return function(_back){
      _curBack=_back
    }
  },
  attachInfoToReport:function(v){
    window._ideReport&&_ideReport._attachInfo(v)
  },
  jsonToXML:function(_obj,_root) {
    if(!_root||_root===1){
      _root="data"
    }
    let _xml = '';
    for (let _prop in _obj) {
      let v=_obj[_prop]
      if(v&&v.constructor==Function){
        continue
      }
      _xml += v instanceof Array ? '' : "<" + _prop + ">";
      if (v instanceof Array) {
        for (let _array in v) {
          _xml += "<" + _prop + ">";
          _xml += $util.jsonToXML(new Object(v[_array]),1);
          _xml += "</" + _prop + ">";
        }
      } else if (typeof v == "object") {
        _xml += $util.jsonToXML(new Object(v),1);
      } else {
        _xml += v;
      }
      _xml += v instanceof Array ? '' : "</" + _prop + ">";
    }
    _xml=_xml.replace(/<\/?[0-9]{1,}>/g, '');
    if(_root&&_root!==1){
      _xml=`<${_root}>${_xml}</${_root}>`
    }
    return _xml
  },
  xmlToJson:function(x) {
    let j = {},cj,ps=[j],k;
    let xo=x.match(/<[^< \n>]+(>| |\n)/g);

    if(xo){
      xo.forEach(o=>{
        let i=x.indexOf(o)
        if(i){
          let xx=x.substring(0,i).trim();
          x=x.substring(i)
          if(xx[xx.length-1]==">"){
            xx=xx.substring(0,xx.length-1).trim()
            _addNode(k)
            k=""
            if(xx.endsWith("/")){
              xx=xx.substring(0,xx.length-1).trim()
              _parseProperties(xx,j)
              ps.shift()
              j=ps[0]
            }else{
              _parseProperties(xx,j)
            }
          }else{
            if($.isNumeric(xx)){
              j[k]=parseFloat(xx)
            }else{
              j[k]=xx
            }
            k=""
          }
        }
        x=x.substring(o.length).trim()

        if(o[0]=="<"){
          o=o.substring(1)
        }
        if(o[o.length-1]==">"){
          o=o.substring(0,o.length-1)
        }
        if(o[o.length-1]=="/"){
          return
        }
        if(o[0]=="/"){
          o=_glossaryHandler._getVariableName(o.substring(1),0,1)
          if(ps[1]&&(ps[1][o]==j||(ps[1][o]&&ps[1][o].constructor==Array&&ps[1][o].includes(j)))){
            ps.shift()
            j=ps[0]
          }
          return
        }else{
          if(k){
            _addNode(k)
          }
          k=_glossaryHandler._getVariableName(o,0,1)
        }
      })
    }
    return j;

    function _addNode(k){
      let d={}
      if(j[k]){
        if(j[k].constructor!=Array){
          j[k]=[j[k]]
        }
        j[k].push(d)
      }else{
        j[k]=d
      }
      j=d
      ps.unshift(d)
    }

    function _parseProperties(xx,j){
      let xxo=xx.match(/[^\s=]+=\s*"/g)
      if(xxo){
        let k;
        xxo.forEach(o=>{
          if(k){
            let i=xx.indexOf(o)
            let v=xx.substring(0,i)
            xx=xx.substring(i)
            _parseValue(v,j,k)
          }
          xx=xx.substring(o.length)
          o=o.substring(0,o.length-1).trim()
          o=o.substring(0,o.length-1)
          k=o=_glossaryHandler._getVariableName(o,0,1)
        })
        _parseValue(xx,j,k)
      }
    }

    function _parseValue(v,j,k){
      v=v.trim()
      if(v){
        j[k]=v.substring(0,v.length-1)
        if($.isNumeric(j[k])){
          j[k]=parseFloat(j[k])
        }
      }
    }
  },
  getHostIdxByUrl:function(_url){
    _url=_url||location.href
    return _IDE._data._setting.environments[_IDE._data._setting.curEnvironment].items.findIndex(x=>_Util._isSameHost(x.host,_url))
  },
  openApp:function(_url){
    _TWHandler._openUrl(_url)
  },
  toErgodicList:function(v){
    return _Util._toErgodicList(v)
  },
  isMatchParameter:function(p,d){
    return _aiAPI._isMatchParameter(p,d)
  },
  isMatch:function(d1,d2){
    if(d1==d2){
      return !0
    }else if(d1=="bz-skip"||d2=="bz-skip"){
      return !0
    }else if(d1&&d2&&d1.constructor==d2.constructor){
      if(d1.constructor==Array){
        if(d1.length==d2.length){
          for(let i=0;i<d1.length;i++){
            if(!$util.isMatch(d1[i],d2[i])){
              return !1
            }
          }
          return !0
        }
        return !1
      }else if(d1.constructor==Object){
        for(let k in d1){
          if(!$util.isMatch(d1[k],d2[k])){
            return !1
          }
        }
        for(let k in d2){
          if(d1[k]===undefined){
            return !1
          }
        }
        return !0
      }
      return d1==d2
    }else if(d1&&d1.constructor==Array&&d1.length&&d2&&d2.constructor==Object){
      return !d1.find(x=>{
        return !$util.isMatch(x,d2)
      })
    }
    return !1
  },
  noConflictData:function(d1,d2){
    if(d1==d2){
      return true
    }else if(d1&&d2&&d1.constructor==d2.constructor&&d1.constructor==Object){
      for(let k in d1){
        if(d2[k]!==undefined){
          if(!$util.noConflictData(d2[k],d1[k])){
            return false
          }
        }
      }
      return true
    }
    return false
  },
  includes:function(d1,d2){
    if(!d2){
      return d1==d2
    }else if(d2.constructor==Array){
      if(!d1||![Object,Array].includes(d1.constructor)){
        return d2.find(x=>x==d1)
      }else if(d1.constructor==Object){
        return d2.find(x=>$util.includes(d1,x))
      }
      return !d2.find(x=>!$util.includes(x,d1))
    }else if(d2.constructor==Object){
      if(!d1||![Object,Array].includes(d2.constructor)){
        return
      }else if(d1.constructor==Object){
        for(let k in d2){
          if(!$util.includes(d1[k],d2[k])){
            return 
          }
        }
        return 1
      }else{
        return d1.find(x=>$util.includes(x,d2))
      }
    }
    return d1==d2
  },
  getValueFromSetActions:function(){
    let t=BZ._getCurTest()
    if(t){
      t._data.actions.forEach(a=>{
        if(a.type==1&&a.event.type=="change"&&a.element){
          let c=(a.event.value||"").match(_IDE._insertJSOnlyRegex)
          if(c){
            c=c[0]
            _Util._eval("delete "+c)
            let e=$util.findDom(a.element)
            if(e){
              let v=$util.getElementValue(e)
              c=_Util._eval(c+"=v",{v:v})
            }
          }          
        }
      })
    }
    return $parameter
  },
  getElementValue:function(e,fun){
    if(fun){
      return fun(e)
    }
    let os=$(e).find("input,textarea,select").toArray()
    let v;
    if(!os.length){
      if($(e).is("input,textarea,select")){
        os=[e]
      }
    }
    os.forEach(x=>{
      if(x.type=="radio"){
        if(x.selected){
          v=x.value
        }
      }else if(x.type=="checkbox"){
        if(x.checked){
          v=x.value||"on"
        }
      }else if(x.tagName=="SELECT"){
        v=v||""
        for(a of x.selectedOptions){
          v+=","+a.text
        }
        v=v.substring(1)||""
      }else if(x.getBoundingClientRect().width){
        let vv=x.value
        if(!v||vv.length>v.length){
          v=vv
        }
      }
    })
    if(v===undefined){
      v=e.innerText.trim()
    }
    return v
  },
  //getLanguage
  getLanguage:function(){
    return BZ._data._uiSwitch._curAppLanguage
  },
  //translate
  translate:function(v){
    let i=_IDE._data._setting.appLanguages.indexOf(BZ._data._uiSwitch._curAppLanguage)
    if(i){
      let w=_appWordHandler._wordMap[v]
      if(w){
        return w[i-1]||v
      }
    }
    return v
  },
  //randomItem
  randomItem:function(d){
    let i=Math.floor(Math.random()*Object.keys(d).length)
    let k=Object.keys(d)[i]
    return {key:k,value:d[k]}
  },
  //addLogData
  addLogData:function(d){
    _ideTask._logData=_ideTask._logData||[]
    for(var i=0;i<arguments.length;i++){
      _ideTask._logData.push(arguments[0])
    }
  },
  //setLogData
  setLogData:function(d){
    _ideTask._logData=[]
    for(var i=0;i<arguments.length;i++){
      _ideTask._logData.push(arguments[0])
    }
  },
  //cleanLogData
  cleanLogData:function(d){
    _ideTask._logData=[]
  },
  //log
  log:function(){
    let v=_Util._log(...arguments)
    if(!bzTwComm._isIDE()){
      bzTwComm._postToIDE({_scope:"$console",_fun:"output",_args:["App: "+v]});
      return
    }
    $console.output(v)
  },
  //takeScreenshot
  takeScreenshot:function(o,_fun){
    if(bzTwComm._isExtension()&&!o.element){
      return _screenshotHandler._elementImgMd5(o,1,_fun)
    }
    if(!BZ.TW||BZ.TW.closed){
      let _msg=_bzMessage._system._error._missTestWindow
      if(BZ._isAutoRunning()){
        throw new Error(_msg)
      }else{
        return alert(_msg)
      }
    }
    
    if(bzTwComm._isExtension()){
      _domActionTask._takeScreenshot(o,function(v){
        _fun(v)
      })
    }else{
      bzTwComm._postToExt({_fun:"takeScreenshot",_scope:"$util",_args:[{element:o||"BZ.TW.document.body"},_fun],_element:o||["BZ.TW.document"]})
    }

  },
  //findDataInMap
  findDataInMap:function(map,o){
    for(let k in map){
      let v=map[k],found=1
      if(o){
        for(let kk in o){
          if(o[kk]!=v[kk]){
            found=0
            break
          }
        }
      }
      if(found){
        return v
      }
    }
  },
  exeTests:function(ts){
    console.log(ts)
    _ideTask._exeTmpTasks(ts)
  },
  //formatTimestamp
  formatTimestamp:function(t,f){
    return _Util._formatTimestamp(t,f)
  },
  //getScenariosByTag
  getScenariosByTag:function(ts){
    return _ideObjHandler._getItemsByTag(ts,"scenario",1)
  },
  //getTestsBySuite
  getTestsBySuite:function(t,_fun){
    return _ideObjHandler._getRefTests(t,_fun)
  },
  //printScenariosByTag
  printScenariosByTag:function(ts){
    return _ideObjHandler._printItemsByTag(ts,"scenario")
  },
  //downloadFile
  downloadFile:function(_name,_content,_type){
    console.log("BZ-LOG: download-data-file:"+_name)
    _Util._downloadFile(_name,_content,_type)
  },
  //getTestsByTag
  getTestsByTag:function(ts){
    return _ideObjHandler._getItemsByTag(ts,"unit")
  },
  //takeAPPValue
  //for check client app variable value
  takeAPPValue:function(v,_fun){
    try{
      if(bzTwComm._isExtension()){
        if(!$("#bz-val")[0]){
          $("<div id='bz-val' style='display:none'></div>").insertAfter(document.body)
        }
        $("#bz-val").html("")
        //lws
        location.href="javascript:var bzTmpScript=document.createElement('script');"
                     +"bzTmpScript.innerHTML='document.getElementById(\"bz-val\").innerHTML=JSON.stringify(bzTwComm._retrieveData("+v+"))';"
                     +"document.body.append(bzTmpScript)"
        setTimeout(()=>{
          v=$("#bz-val").html()
          try{
            if(v){
              v=JSON.parse(v)
            }
          }catch(ex){}
          _fun(v)
        })
      }else{
        v=_Util._eval("v="+v)
        return v
      }
    }catch(e){
      console.log(e.stack)
    }
  },
  //isEmptyData
  isEmptyData:function(d){
    return d!==0&&(!d||$.isEmptyObject(d))
  },
  //gotoFlag
  gotoFlag:function(s){
    _domActionTask._gotoFlag(s)
  },
  //getRoles
  getRoles:function(){
    try{
      let t=BZ._getCurTest(),
          m=BZ._getCurModule()
      
      return _aiAuthHandler._getRolesByHostId(t?t._data.hostId:m?m._data.defaultHostId:0)
    }catch(e){}
    return []
  },
  //getElementText
  getElementText:function(u,_chkSvg){
  //    return u.innerText?u.innerText.trim():""
    /*
    if(!_back){
      var _time=Date.now()
    }
    */
    if(u.nodeType==3){
      return (u.textContent||"").trim()
    }else if(u.innerText===undefined){
      if(_chkSvg){
        u=$("<div>"+u.outerHTML+"</div>").appendTo(document.body);
        var v=u[0].innerText;
        u.remove()
        return v.trim()
      }else{
        return ""
      }
    }else if(!u.innerText||!u.innerText.trim()){
      return ""
    }
    if(["SCRIPT","STYLE","SELECT","TEXTAREA"].includes(u.tagName)){
      return ""
    }else if(u.tagName=="BR"){
      return "\n"
    }
    var t="",co=0,lo=0,s,r=u.getBoundingClientRect();
    for(var i=0;i<u.childNodes.length;i++){
      var n=u.childNodes[i],tt="";
      if(n.nodeType==1){
        if(!_Util._isHidden(n)){
          tt=$util.getElementText(n,_chkSvg)
          co=n.getBoundingClientRect()
        }else{
          continue
        }
      }else if(n.nodeType==3){
        tt=n.textContent.trim()
        co=0
      }
      if(tt){
        if(lo){
          if(co){
            if(lo.bottom>co.top){
              s="\n"
            }else{
              s=" "
            }
          }else{
            if(lo.width+lo.left>=r.left+r.width-20){
              s="\n"
            }else{
              s=" "
            }
          }
        }else if(t){
          if(co){
            if(co.left==r.left){
              s="\n"
            }else{
              s=" "
            }
          }else{
            s=" "
          }
        }else{
          s=""
        }
        t+=s+tt
      }
    }
    /*
    if(!_back){
      $util._chkFunTime+=Date.now()-_time
    }
    */
    return t.trim()
  },
  //printDataToFile
  printDataToFile:function(f,d){
    if(f.toLowerCase().endsWith("csv")){
      d=_Util._toFileCSV($util.jsonToCSV(d))
    }else if(f.toLowerCase().endsWith("html")){
      d=_Util._toFileCSV($util.listToHtml(d))
    }else{
      d=JSON.stringify(d,0,2)
    }
    d=f+"\n"+d.trim()+"\n"
    console.log("BZ-OUTPUT-FILE:"+d+"BZ-OUTPUT-FILE-END")
  },
  //jsonToCSV
  jsonToCSV:function(d){
    if(d&&d.constructor==Array&&d.length){
        return Object.keys(d[0]).join(",")+"\n"+
      d.map(o=>{
        let v=""
        for(var k in o){
            let x=o[k]
            v+=x&&x.constructor==String?'"'+o[k].replace(/\"/g,'""')+'",':o[k]+','
        }
        return v.replace(/,(\n|$)/g,"\n").trim()
      }).join("\n")
    }
    return ""
  },
  //listToHtml
  listToHtml:function(d,c){
    if(d&&d.constructor==Array&&d.length){
      let _header="<tr><th>"+Object.keys(d[0]).join("</th><th>")+"</tr>"
      _header=_header.replace("</th><th></tr>","</th></tr>")+"\n"
      c=c||"table{width:100%}table,tr,td,th{border-collapse: collapse;border: 1px solid black;padding: 5px;}"
      return "<!DOCTYPE html><html><head><style>"+c+"</style></head><body><table>"+_header+d.map(o=>{
        let v="<tr>"
        for(var k in o){
          v+="<td>"+(o[k]&&o[k].constructor==String?o[k].replace(/\</g,'&lt;').replace(/\>/g,"$gt;"):o[k])+"</td>"
        }
        return v+"</tr>"
      }).join("\n")+"</table></body></html>"
    }
    return ""
  },
  //clearCookie
  clearCookie:function(_document){
    var cookies = _document.cookie.split("; ");
    for (var c = 0; c < cookies.length; c++) {
      var d = window.location.hostname.split(".");
      var _name=encodeURIComponent(cookies[c].split(";")[0].split("=")[0])
      // console.log(_name)
      _document.cookie = _name + '=; Max-Age=-99999999;';
    }
  //    _document.cookie.split(";").forEach(function(c) { _document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
  },
  //p: data path. like: "$test.data"
  //resetData
  resetData:function(pp){
    let d,p=pp.split(".")
    switch(p[0]){
      case "$project":d=$data(0,0,1);break;
      case "$module":d=$data(BZ._getCurModule()._data.code,0,1);break;
      case "$test":d=$data(BZ._getCurModule()._data.code,BZ._getCurTest()._data.code,1);break;
      case "$parameter":d=BZ._getCurTest()._data.defParameter;break;
    }
    if(d){
      try{
        if(d.constructor==String){
          d=_Util._eval("d="+d)
          _ideDataManagement._initRandomValue(d)
        }
        if(p.length>1){
          for(let i=1;i<p.length;i++){
            d=d[p[i]]
          }
          _Util._eval(pp+"=d",{d:d})
        }else{
          _Util._eval("pp="+pp)
          for(var k in d){
            pp[k]=d[k]
          }
        }
      }catch(e){}
    }
  },
  //generateDataByRegex
  generateDataByRegex:function(d,key,dd,kk,_notRoot){
    let _apiData
    d=_handleData(d,key,dd,kk)
    function _handleData(d,_key,dd,kk){
      if(!d){
      }else if([String,RegExp].includes(d.constructor)){
        let s=d.toString()
        if(s.match(/^[\/].+[\/]$/)){
          d= $util.generateWordsByRegex(s,_key,dd,kk)
        }else{
          d=s.match(/\{\{.+\}\}/)?_JSHandler._prepareData(s):s
        }
        if(d&&!bzTwComm._isExtension()&&d.constructor==BZApiDataPicker){
          _apiData=d
        }
      }else if([Object,Array].includes(d.constructor)){
        for(var k in d){
          d[k]= _handleData(d[k],k,d,k,1)
        }
      }
      return d
    }
    
    if(_apiData){
      _apiDataHandler._registerExeFun(function(){
        _doIt(d)
      })
    }else{
      _doIt(d)
    }
    return d
    
    function _doIt(d){
      if(dd){
        if(dd.constructor==Function){
          dd(d)
        }else if(kk){
          dd[kk]=d
        }
      }
    }
  },
    /*
    examples:
    let vs=[
      "[a-z]+[0-9]+",
      "BZ-name",
      "{today}",
      "{today-10}",
      "{today+10|MM/dd/yyyy}",
      "{today-1week|MM/dd/yyyy}",
      "{today+w}",
      "{today-1M}",
      "{today+M|MM/dd/yyyy}",
      "{today-1Y}",
      "{today+Y|MM/dd/yyyy}",
      "{today+10y+2M+1|MM/dd/yyyy}",
      "{this-month-first}",
      "{this-month-first+10|MM/dd/yyyy}",
      "{this-month-first+10M-2}",
      "{date:08/30/2020|MM/dd/yyyy|yyyy-MM-dd}",
      "{date:08/30/2020+y+1|MM/dd/yyyy|yyyy-MM-dd}",
      "{this-month,3}",
      "{date:08/20/2020+y+2M+12+7m+33s+3h|MM/dd/yyyy|yyyy-MM-dd hh:mm:ss}",
      "{last-month-first+y+2M+12+7m+33s+3h|MM/dd/yyyy|yyyy-MM-dd hh:mm:ss}"
    ]
    vs.forEach(v=>{
      console.log(v+": "+$util.generateWordsByRegex("/"+v+"/"))
    })
    */
  //generateWordsByRegex
  generateWordsByRegex(r,_key,_ddd,_kkk){
    try{
      if(!r){
        return _return(r)
      }
      r=r.toString()
      
      if(_Util._hasInsertCode(r)){
        r=_JSHandler._prepareData(r)
        return _return(r)
      }else if(_Util._hasCode(r)){
        r=_Util._eval("r="+r)
        return _return(r)
      }
      
      if(r[0]=="/"&&r[r.length-1]=="/"){
        r=r.substring(1,r.length-1)
      }
      if(r[0]=="/"&&r[r.length-1]=="/"){
        return _return("/"+r+"/")
      }
      r=_Util._getRegexByBZName(r)
      let _std=r.match(/\{(label|random:?|search[\: ]|search-list[\: ]|new[\: ]|exist-new[\: ]|exist[\: ]|exist-list[\: ]|date[\: ]|time[\: ]|num|time|date|module|this|next|last|today|tomorrow|yesterday|timestamp|textstamp|longtextstamp)[^\}]*\}/g)
      if(_std){
        if(_std[0]=="{label}"){
          return _Util._idToName($util.generateWordsByRegex(r.replace("{label}",_key||_bzMessage._common._description)));
        }else if(_std[0]&&_std[0].startsWith("{random")){
          return _return(_getRandom(_std[0]))
        }else if(_std[0]&&_std[0].startsWith("{exist")){
          if(bzTwComm._isExtension()){
            return ""
          }
          let v= _return(_getExist(_std[0]))
          return v
        }else if(_std[0]&&_std[0].startsWith("{new")){
          console.log("BZ-LOG: "+_std[0])
          return _return(_getCreate(_std[0]))
        }else if(_std[0]&&_std[0].startsWith("{search")){
          console.log("BZ-LOG: "+_std[0])
          return _return(_getSearch(_std[0]))
        }
        _std.forEach(s=>{
          let _stdValue=getStandard(s)
          let vs=r.split(s)
          let _result=""
          for(var i=0;i<vs.length;i++){
            _result+=vs[i]
            if(i<vs.length-1){
              _result+=_stdValue
            }
          }
          r=_result
        })
        return $util.generateWordsByRegex(r,_key,_ddd,_kkk)
      }else{
        _std=r.match(/\{data[\: ](.+)\}/)
        if(_std){
          _std=_std[1]
          _std=_std.replace(/[\=\>\<\!]/g,"")
          return _return(_std)
        }else{
          var vs=[];
          var m=1;
          if(m.constructor!=Number){
            m=1
          }
          for(var i=0;i<m;i++){
            vs.push(new RandExp(r).gen())
          }
          vs=vs[0]
          
          return _return(vs)
        }
      }
    }catch(e){}
    
    function _return(v){
      if(_ddd){
        if(_ddd.constructor==Function){
          _ddd(v)
        }else{
          _ddd[_kkk]=v
          if(v&&v.constructor==Promise){
            v.then(x=>_ddd[_kkk]=x)
          }
        }
      }
      return v===null?undefined:v
    }
    function _getRandom(vv){
      let v=vv.split(":")[1]
      if(v){
        v=v.substring(0,v.length-1)
        v=v.split("|")
        if(v[0].match(/^[0-9-\.]+$/)||_Util._hasCode(v[0])){
          return _getRandomNumber(v[0],v[1])
        }else if(v.length>1){
          v=$util.randomItem(v)
          if(v){
            return v.value
          }
        }
      }
      return "/"+vv+"/"
    }
    
    function _getRandomNumber(vv,ee){
      let v1,v2,e,v=vv.split(/[-~]/)
      if(_Util._hasCode(vv)){
        v=vv.split(/~/)
      }
      if(v.length>1){
        v1=parseFloat(_Util._stringToData(v[0]))
        v2=parseFloat(_Util._stringToData(v[1]));
      }else{
        v1=0
        v2=v;
      }
      let vvv=Math.random()*(v2-v1)+v1,l=1;
      if(v[0].match(/[0-9]+\.[0-9]+/)){
        l=v[0].split(".")[1].length
        l=Math.pow(10,l)
      }else if(v[1].match(/[0-9]+\.[0-9]+/)){
        l=v[1].split(".")[1].length
        l=Math.pow(10,l)
      }
      vvv=vvv*l
      v= Math.round(vvv)/l
      if(v>v2){
        v=v2
      }
      if(ee){
        e=ee.split(",")
        if(e.includes(v+"")&&v1!=v2){
          return _getRandomNumber(vv,ee)
        }
      }
      return v
    }
    
    async function _getExist(v){
      let s={};
      if(v.match(/\{exist-list[ :]/)){
        s={_list:1}
        v=v.replace(/\{exist-list[ :](.+)\}/,"$1")
      }else if(v.match(/\{exist-new[ :]/)){
        s={_new:1}
        v=v.replace(/\{exist-new[ :](.+)\}/,"$1")
      }else{
        v=v.replace(/\{exist[ :](.+)\}/,"$1")
      }
      return await _aiAPI._getExistData(v,s,_ddd,_kkk)
    }
    
    async function _getCreate(v){
      let s;
      v=v.replace(/\{new[ \:](.+)\}/,"$1")
      return await _aiAPI._createData(v,_ddd,_kkk)
    }
    async function _getSearch(v){
      let s={};
      if(v.match(/\{search-list[ :]/)){
        s={_list:1}
        v=v.replace(/\{search-list[ :](.+)\}/,"$1")
      }else if(v.match(/\{search-new[ :]/)){
        s={_new:1}
        v=v.replace(/\{search-new[ :](.+)\}/,"$1")
      }else{
        v=v.replace(/\{search[ :](.+)\}/,"$1")
      }
      return await _aiAPI._searchData(v,s,_ddd,_kkk)
    }

    function getStandard(v){
      let now=new Date(),n,d=new Date();
      var y=d.getFullYear(),m=d.getMonth();
      
      v=v.substring(1,v.length-1)
      v=v.split("|")
      if(v.length>1&&v[0].startsWith("date:")){
        return _getDate(v[0],v[1],v[2])
      }
      var w=v[0].match(/[a-z-]+[a-z]/),c;
      if(!w){
        w=v[0]
      }else{
        w=w[0]
        c=v[0].substring(w.length)
      }
      switch(w){
        case "now": 
        case "this":
        case "this-month":
        case "today": 
          break;
        case "num": 
          $project._tmpIdx=$project._tmpIdx||1
          return $project._tmpIdx++
        case "module": 
          let _tmpModule=window._tmpTakeDataModule||BZ._getCurModule()
          if(_tmpModule){
            return _tmpModule._data.name.replace(/[ ,\.-]+/g,"-")
          }
          return "Module"
        case "timestamp": return Date.now();
        case "time": return _Util._formatTimestamp(0,"hh:mm:ss");
        case "date": return _Util._formatTimestamp(0,"yyyy-MM-dd");
        case "this-month-first": 
          d.setDate(1)
          break;
        case "this-month-end":
          d.setDate(_getLastDate(d.getMonth()+1,d.getYear()))
          break;
        case "this-year-first": 
          d.setDate(1)
          d.setMonth(0)
          break;
        case "this-year-end":
          d.setMonth(11)
          d.setDate(31)
          break;
        case "tomorrow": 
          d=new Date(d.getTime()+86400000);
          break;
        case "longtextstamp":
          w=_Util._to62(parseInt(Date.now()/1000))
          if(_cooperatorHandler._data.inService){
            w+=_cooperatorHandler._data.key
          }
          return w
        case "textstamp":
          w=_Util._to36(parseInt(Date.now()/1000))
          if(_cooperatorHandler._data.inService){
            w+=_cooperatorHandler._data.key
          }
          return w
        case "timestamp":
          w=parseInt(Date.now()/1000)+""
          if(_cooperatorHandler._data.inService){
            w+=_cooperatorHandler._data.key
          }
          return w
        case "yesterday":
          d=new Date(d.getTime()-86400000);
          break;
        case "last-year":
          d.setYear(y-1);
          break
        case "last-year-first":
          d.setMonth(0)
          d.setDate(1);
          d.setYear(y-1);
          break
        case "last-year-end":
          d.setMonth(11)
          d.setDate(31);
          d.setYear(y-1);
          break
        case "last-month": 
          if(d.getMonth()){
            d.setMonth(d.getMonth()-1);
          }else{
            d.setMonth(11);
            d.setYear(y-1)
          }
          break
        case "last-month-first": 
          d.setDate(1);
          d.setMonth(d.getMonth()-1);
          break
        case "last-month-end": 
          d.setDate(1);
          if(d.getMonth()){
            d.setMonth(d.getMonth()-1);
          }else{
            d.setMonth(11);
            d.setYear(y-1)
          }
          d.setDate(_getLastDate(d.getMonth()+1,d.getYear()));
          break
        case "last-hour":
          d=new Date(d.getTime()-3600000)
          break
        case "last-minute":
          d=new Date(d.getTime()-60000)
          break
        case "last-second":
          d=new Date(d.getTime()-1000)
          break
        case "last-mon":
          n=6
        case "last-tus":
          n=n||5
        case "last-wed":
          n=n||4
        case "last-thu":
          n=n||3
        case "last-fri":
          n=n||2
        case "last-sat":
          n=n||1
        case "last-sun":
          n=n||7
          d=new Date(d.getTime()-86400000*(n+d.getDay()))
          break
        case "next-year":
          d.setYear(y+1);
          break
        case "next-year-first":
          d.setMonth(0)
          d.setDate(1);
          d.setYear(y+1);
          break
        case "next-year-end":
          d.setMonth(11)
          d.setDate(31);
          d.setYear(y+1);
          break
        case "next-month": 
          d.setMonth(d.getMonth()+1);
          break
        case "next-month-first":
          d.setDate(1);
          d.setMonth(d.getMonth()+1);
          break
        case "next-month-end": 
          d.setMonth(d.getMonth()+1);
          if(d.getMonth()+1==12){
            d.setDate(_getLastDate(0,d.getYear()+1));
          }else{
            d.setDate(_getLastDate(d.getMonth()+1,d.getYear()));
          }
          break
        case "next-hour":
          d=new Date(d.getTime()+3600000)
          break
        case "next-minute":
          d=new Date(d.getTime()+60000)
          break
        case "next-second":
          d=new Date(d.getTime()+1000)
          break
        case "next-mon":
          n=8-now.getDay();
        case "next-tus":
          n=n||9-now.getDay();
        case "next-wed":
          n=n||10-now.getDay();
        case "next-thu":
          n=n||11-now.getDay();
        case "next-fri":
          n=n||12-now.getDay();
        case "next-sat":
          n=n||13-now.getDay();
        case "next-sun":
          n=n||7-now.getDay()
          d=new Date(d.getTime()+86400000*n)
          break
        case "this-mon":
          n=n||1
        case "this-tus":
          n=n||2
        case "this-wed":
          n=n||3
        case "this-thu":
          n=n||4
        case "this-fri":
          n=n||5
        case "this-sat":
          n=n||6
        case "this-sun":
          n=n||0
          if(n){
            d=new Date(now.getTime()+86400000*(n-now.getDay()))
          }else{
            d=new Date(now.getTime()-86400000*now.getDay())
          }
      }
      
      if(c){
        if(c[0]==","){
          //for this month, last month, next month only
          d.setDate(parseInt(c.substring(1)))
        }else{
          d=_countDay(d,c)
        }
      }
      
      
      if(v.length==1){
        v.push("yyyy-MM-dd")
      }
      return _Util._formatTimestamp(d.getTime(),v[1])
      // for(var i=1;i<v.length;i++){
        // if(v[i].match(/^[0-9]+$/)){
          // d.setDate(parseInt(v[1]))
        // }else if(v[i].match(/^[0-9]+-[0-9]+$/)){
          // var vv=v[i].split("-")
          // d.setDate(parseInt(vv[1]))
          // d.setMonth(parseInt(vv[0])-1)
        // }else if(v[i]=="end"){
          // d.setDate(_getLastDate(d.getMonth()+1,d.getFullYear()))
        // }else{
          // return v[i].replace(/yyyy/i,d.getFullYear())
                 // .replace(/yy/i,_Util._formatNumberLength(d.getFullYear()%100))
                 // .replace(/MM/,_Util._formatNumberLength(d.getMonth()+1))
                 // .replace(/dd/i,_Util._formatNumberLength(d.getDate()))
                 // .replace(/hh/i,_Util._formatNumberLength(d.getHours()))
                 // .replace(/mm/,_Util._formatNumberLength(d.getMinutes()))
                 // .replace(/ss/i,_Util._formatNumberLength(d.getSeconds()))
                 // .replace(/M/,d.getMonth()+1)
                 // .replace(/d/i,d.getDate())
                 // .replace(/h/i,d.getHours())
                 // .replace(/m/,d.getMinutes())
                 // .replace(/s/i,d.getSeconds())
        // }
      // }
      
    }
    
    function _getLastDate(m,y){
      if([1,3,5,7,8,10,12].includes(m)){
        return 31
      }else if(m==2){
        return y%4?28:29
      }
      return 30
    }
    
    function _countDay(d,v){
      if(v){
        v=v.match(/[+-]([0-9]*y|[0-9]*M|[0-9]*w|[0-9]*d|[0-9]*h|[0-9]*m|[0-9]*s|[0-9]+)/gi)
        v&&v.forEach(vv=>{
          vv=vv.match(/([-+])([0-9]*)(y|Y|M|w|W|h|H|d|D|m|S|s)*/)
          if(!vv[2]){
            vv[2]=1
          }
          v=parseInt(vv[1]+vv[2])
          
          switch(vv[3]){
            case "Y":
            case "y":d.setYear(d.getFullYear()+v);break;
            case "M":d.setMonth(d.getMonth()+v);break;
            case "W":
            case "w":d.setDate(d.getDate()+v*7);break;
            case "H":
            case "h":d.setHours(d.getHours()+v);break;
            case "m":d.setMinutes(d.getMinutes()+v);break;
            case "S":
            case "s":d.setSeconds(d.getSeconds()+v);break;
            case "d":
            case "D":
            default:
              d.setDate(d.getDate()+v)
          }
        })
      }      
      return d
    }
    //d: date, pf: parse date format, ft: format to
    function _getDate(d,pf,ft){
      d=d.substring(5)
      ft=ft||pf
      let f1=pf.split(_Util._allSign),
          f2=pf.split(_Util._allLetterAndNumber),
          d1=d.split(_Util._allSign),
          d2=d.split(_Util._allLetterAndNumber),c,ii=0,i=0,df={},fd="",
          ff=/yyyy|YYYY|yy|YY|MM|M|DD|dd|D|d|HH|H|hh|h|mm|m|SS|ss|S|s/g,
          di=["yy","yyyy","YY","YYYY","MM","M","DD","dd","D","d","HH","hh","H","h","mm","m","SS","ss","S","s"]
          
      _Util._spliceAll(f1,a=>{return !a})
      _Util._spliceAll(f2,a=>{return !a})
      _Util._spliceAll(d1,a=>{return !a})
      _Util._spliceAll(d2,a=>{return !a})
      d1.splice(f1.length)
      d2.splice(f2.length)
      if(f1.length){
        if(f1.length==1){
          i=f1[0].length
        }else{
          i=f1.reduce((v,o)=>{
            return (v.length||v)+(o?o.length:0)
          })
        }
      }
      if(f2.length){
        if(f2.length==1){
          ii=f2[0].length
        }else{
          ii=f2.reduce((v,o)=>{
            return (v.length||v)+(o?o.length:0)
          })
        }
      }
      i+=ii
      c=d.substring(i)
      d=d.substring(0,i)
      
      f1.forEach((v,j)=>{
        v=v.match(ff)
        v&&v.forEach(vv=>{
          if(v.length==1){
            df[vv]=d1[j]
          }else{
            df[vv]=d1[j].substring(0,vv.length)
            d1[j]=d1[j].substring(vv.length)
          }
        })
      })

      // di.forEach(v=>{
        // fd+=df[v]||""
        // if(
      // })
      d=new Date()
      d.setDate(1)
      for(let kk in df){
        let k=kk[0]
        if(k=="D"||k=="d"){
          let v=df[kk]
          delete df[kk]
          df[kk]=v
        }
      }
      for(let kk in df){
        let k=kk[0],
            v=df[kk]
            v=parseInt(v)||v
        switch(k){
          case "Y":
          case "y":
            if(kk.length==2){
              if(v>70){
                v+=1900
              }else{
                v+=2000
              }
            }
            d.setYear(v);
            break;
          case "M":d.setMonth(v-1); break;
          case "D":
          case "d":d.setDate(v);break;
          case "H":
          case "h":d.setHours(v);break;
          case "m":d.setMinutes(v);break;
          case "S":
          case "s":d.setSeconds(v);
        }
      }
      
      d=_countDay(d,c)
      return _Util._formatTimestamp(d.getTime(),ft)
    }
  },
  //triggerKeyEvents
  triggerKeyEvents:function(o,k,ch,c,a,s,_fun){ //c:ctrl, a:alt, s:shift
    if(_Util._isSysButton(o)&&[13,32].includes(k)){
      return $util.triggerMouseEvents(o,"click",0,0,0,0,0,_fun)
    }
    $(o).focus();
    setTimeout(()=>{
      $util.triggerKeyEvent(o,"keydown",k,ch,c,a,s)
      _exe("_keydownDone",function(){
        if((!c && !a) || _Util._checkBrowserType().name=="firefox"){
          if(_Util._isHidden(o)){
            return _finalFun()
          }
          $util.triggerKeyEvent(o,"keypress",k,ch,c,a,s)
          _exe("_keypressDone",function(){
          if(_Util._isHidden(o)){
            return _finalFun()
          }
            $util.triggerKeyEvent(o,"textInput",k,ch,c,a,s);
          if(_Util._isHidden(o)){
            return _finalFun()
          }
            $util.triggerKeyEvent(o,"input",k,ch,c,a,s);
          if(_Util._isHidden(o)){
            return _finalFun()
          }
            $util.triggerKeyEvent(o,"keyup",k,ch,c,a,s);
            if(k==9 && ["INPUT","SELECT","A","LINK","BUTTON","TEXTAREA"].includes(o.tagName)){
              _Util._focusNextByTab(o)
            }
            _finalFun()
          })
        }else{
          $util.triggerKeyEvent(o,"keyup",k,ch,c,a,s);
          _finalFun()
        }
      })
    },1)
    function _exe(k,_next,_timer){
      _timer=_timer||Date.now()
      if(o[k]||Date.now()-_timer>50){
        o[k]=0
        return _next()
      }
      setTimeout(function(){
        _exe(k,_next,_timer)
      },1)
    }
    
    function _finalFun(){
      _fun&&_fun()
    }
  },
  //triggerKeyEvent
  triggerKeyEvent:function(o,e,k,ch,c,a,s){
      if(!o){
        return
      }
    $(o).focus()
    o._bzKey=ch
    o._bzKeyCode=k
    if(ch&&o.maxLength&&o.maxLength>0&&o.maxLength<=(o.value+"").length){
      return
    }
    if(!e.startsWith("key")){
      e="key"+e;
    }
    if(e=="keypress"){
      k=ch;
    }
    if(!o._bzSetKeyPress){
      o._bzSetKeyPress=1;
      
      $(o).keydown(function(_event){
        this._keydownDone=1
        this._bCancel=_event.originalEvent.cancelBubble
      });
      $(o).keypress(function(_event){
        this._keypressDone=1
        if(!this._bCancel && !_event.originalEvent.isTrusted){
          if(this._bzKey && (this.tagName=="TEXTAREA" || (this.tagName=="INPUT" && this._bzKey))){
            this.value+=String.fromCharCode(this._bzKey);
          }else if(this._bzKeyCode==13 && ["INPUT","SELECT"].includes(this.tagName)){
            var f=_Util._getParentByTagName(this,"FORM")
            if(f){
              var o=$(f).find("input[type=submit]")[0]
              if(o){
                f.submit()
              }else{
                f.dispatchEvent(new Event("submit"));
              }
            }
          }
        }
        this._bCancel=0
      })
    }
    
    let _jsPath
    if(document.activeElement!=o){
      o.bzTmp=_cssHandler._findPath(o)
      _Util._setFindDomJS(o)
      _jsPath=o._jsPath
    }else{
      _jsPath="document.activeElement"
    }
    let _key=k==13?"Enter":k==9?"Tab":k==32?"Space":String.fromCharCode(ch),
        _code=k==13?"Enter":k==9?"Tab":k==32?"Space":'Key'+String.fromCharCode("+ch+").toUpperCase()
    var s="setTimeout(function(){var o="+_jsPath+";var k = new KeyboardEvent('"+e+"', {bubbles:true}); "
         +"Object.defineProperty(k, 'charCode', {get:function(){return "+(e=="keypress"?ch:0)+";}});"
         +"Object.defineProperty(k, 'keyCode', {get:function(){return "+k+";}});"
         +"Object.defineProperty(k, 'which', {get:function(){return "+k+";}});"
         +"Object.defineProperty(k, 'key', {get:function(){return '"+_key+"';}});"
         +"Object.defineProperty(k, 'code', {get:function(){return '"+_code+"';}});"
         +"Object.defineProperty(k, 'composed', {get:function(){return true;}});"
         +"k.charCodeVal = "+(ch||0)+";"
         +"o.dispatchEvent(k);},0);"
    bzTwComm._postToApp({c:s})
    
  },
  //o:element, e:event, b:button, x, y, c:ctrlKey, a:alt, s:shift, t:target,tr:dataTransfer
  //triggerMouseEvent
  triggerMouseEvent:function(o,e,b,x,y,c,a,s,tr,_fun){
      if(!o){
        return
      }
    var _curWin=_Util._getWindowFromDom(o);
    if(o.tagName=="CANVAS"&&o.bzTxtElement&&(["click","mousedown","dblclick"].includes(e)||("mouseup"==e&&x==-1&&y==-1))){
      let r=o.getBoundingClientRect(),
          te=o.bzTxtElement;
      if(o._offset){
        x=o._offset.x
        y=o._offset.y
      }else{
        x=r.left+te.x+te.w/2
        y=r.top+te.y+te.h/2
      }
    }
    b=parseInt(b||1);
    x=parseInt(x||0)
    y=parseInt(y||0)
    if(b==2 && e=="click"){
      e="contextmenu"
    }else if(e=="click"){
      b=0
    }
    var ps={
      'view': _curWin,
      'bubbles': true,
      //composedPath:$util.getComposedPath(o),
      'cancelable': true,
      buttons:parseInt(b),
      ctrlKey:c,
      metaKey:false,
      altKey:a,
      shiftKey:s,
      clientX:x,
      clientY:y,
      pointerX:x,
      pointerY:y,
      relatedTarget:null
    },_event
    if(tr){
      ps.dataTransfer=tr;
      ps.target=o;
      _event = new DragEvent(e, ps);
    }else{
      _event = new MouseEvent(e, ps);
    }
    o.dispatchEvent(_event);
    if(e=="mouseover"){
      o.dispatchEvent(new MouseEvent("mouseenter",ps));
    }else if(e=="mousedown"){
      o.dispatchEvent(new MouseEvent("pointerdown",ps));
    }else if(e=="mouseup"){
      o.dispatchEvent(new MouseEvent("pointerup",ps));
    }else if(e=="mousemove"){
      o.dispatchEvent(new MouseEvent("pointermove",ps));
    }
    if(_fun){
      _fun()
    }
  },
  getComposedPath:function(o){
    
  },
  //triggerFocusEvent
  triggerFocusEvent:function(o){
    var _event=new FocusEvent("focus")
    o.dispatchEvent(_event)
  },
  //triggerWheelEvent
  triggerWheelEvent:function(o,v){
    var _event = new WheelEvent({
      'view': _curWin,
      'bubbles': true,
      'cancelable': true,
      deltaX:v,
      deltaY:v,
      deltaZ:v
    });
    return o.dispatchEvent(_event);
    
    var e = jQuery.Event( "DOMMouseScroll",{delta: v} );
    $(o).trigger(e)
  },
  //triggerDblClickEvents
  triggerDblClickEvents:function(o,b,x,y,c,a,s){
    $util.triggerMouseEvents(o,b,x,y,c,a,s)
    $util.triggerMouseEvents(o,b,x,y,c,a,s)
    $util.triggerMouseEvent(o,"dblclick",b,x,y,c,a,s);
  },
  //triggerMouseEvents
  triggerMouseEvents:function(o,b,x,y,c,a,s,_fun){
    x=x||1
    y=y||1
    this.triggerMouseEvent(o,"mouseenter",0,x,y,c,a,s);
    this.triggerMouseEvent(o,"mouseover",0,x,y,c,a,s);
    this.triggerMouseEvent(o,"mousemove",0,x,y,c,a,s);
    this.triggerMouseEvent(o,"mousedown",b,x,y,c,a,s);
    if(o.tagName=="CANVAS"&&o.bzTxtElement){
      this.triggerMouseEvent(o,"mouseup",b,-1,-1,c,a,s);
    }else{
      this.triggerMouseEvent(o,"mouseup",b,x,y,c,a,s);
    }
    this.triggerMouseEvent(o,"click",b,x,y,c,a,s);
    if(_Util._isFocusable(o)){
      this.triggerFocusEvent(o)
    }
    if(_fun){
      _fun()
    }
  //    this.triggerMouseEvent(o,"mouseout",0,x,y,c,a,s);
  //    $(o).focus();
  },
  //triggerChangeEvent
  triggerChangeEvent:function(o,v,_blur,_result,_withEnter,_withSubmit,_fun,_noAutoSelect){
    if(!_withEnter&&!_withSubmit&&o.tagName=="INPUT"&&o.type!="file"){
      _Util._preTriggerEvent()
    }else{
      _noAutoSelect=1 
    }
    var ff,ov=v;
    o.focus()
    _doIt()
    // $util.triggerMouseEvents(o,1,0,0,0,0,0,function(){
    //   setTimeout(()=>{
    //   },v=="christina@pivohub"?3000:0)
    // })
  //    o.value=this._getRealWord(o,v);
    function _doIt(){
      try{
        if(!_Util._isStdInputElement(o)){
          if(!o.attributes["contenteditable"]&&(!v||$util.getElementText(o).includes(v)||v.startsWith("/{random"))){
            return $util.triggerMouseEvents(o,1,0,0,0,0,0)
          }else if(o.attributes["contenteditable"]){
            o.innerHTML=v;
          }
        }else if(o.tagName=="SELECT"){
          v=v.toLowerCase().trim()
          var _best=0,_found;
          for(var i=0;i<o.options.length;i++){
            var t=o.options[i].text || o.options[i].textContent||"";
            t=t.toLowerCase()
            if(v==t){
              o.options[i].selected=_found=true;
              break
            }else if(v.includes(t)){
              if(t.length>_best){
                _best=t.length
                o.options[i].selected=_found=true;
              }
            }else if(t.includes(v)){
              if(v.length>_best){
                _best=v.length
                o.options[i].selected=_found=true;
              }
            }
          }
          if(!_found&&_result){
            _result._type=2;
            _result._msg=_Util._formatMessage(_bzMessage._action._setValueFailed,[ov])
          }
        }else if(o.type=="file"){
          _uploadHandler._setFileValue(o,v);
    //        ff=_Util._eval("ff="+v);
    //        v=_uploadHandler._buildUploadBold(ff);
        }else if(o.value!=v){
    //        o.value=v;
        }
        
        if(o.type!="file"){
          //trigger react event
          if(o.tagName=="INPUT"){
            o.value=v
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(o.ownerDocument.defaultView.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(o,v);
          }else if(o.tagName=="TEXTAREA"){
            o.value=v
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(o.ownerDocument.defaultView.HTMLTextAreaElement.prototype, "value").set;
            nativeInputValueSetter.call(o,v);
          }else if(o.tagName!="SELECT"){
            if(o.value!=v){
              o.value=v
            }
          }
          try{
            var event = new Event("input", { bubbles: true });
            o.dispatchEvent(event);
          }catch(e){
            _domActionTask._reportAppInfo("error on Set: "+e.stack)
          }
        }
        try{
          var event = new Event("change", { bubbles: true });
          o.dispatchEvent(event);
        }catch(e){
          console.log(e.stack);
        }
        if(_withEnter){
          $util.triggerKeyEvents(o,13,0,false,false,false,function(){
            _doFinal()
          });
        }else if(_withSubmit){
          let _form=_Util._getParentElementByCss("form",o)
          if(_form){
            _doFinal()
            _form.submit()
          }
        }else if(!_noAutoSelect){
          _autoClickMenuAfterSetValue(v,o,_doFinal)
        }else{
          _doFinal()
        }
      }catch(eee){
        console.log(eee.stack);
      }
    }
    
    function _doFinal(){
      if(_blur){
        $util.triggerBlurEvent(o);
      }
      _fun&&_fun()
    }
    function _autoClickMenuAfterSetValue(v,dom,_afterFun){
      if(!_handleDiff(v,dom,_afterFun)){
        if(!_Util._isHidden(dom)){
          $util.triggerKeyEvents(dom,null,null,false,false,false,_afterFun);
        }else{
          _afterFun&&_afterFun()
        }
        setTimeout(()=>{
          if(!_Util._isHidden(dom)){
            _handleDiff(v,dom)
          }
        },50)
      }
    }

    function _handleDiff(v,dom,_afterFun){
      try{
        let _diff=_Util._getDiffAfterTriggerEvent()
        if(_diff){
          _diff=$(_diff).find(`:Contains(${v})`).toArray()
          if(_diff.length){
            _diff=_diff.filter((x,i)=>{
              if(_diff.length-i>1){
                return !$(_diff[i]).find(_diff[i+1])[0]&&x.getBoundingClientRect().width>20
              }else{
                return 1
              }
            })
            if(_diff.length){
              let ds=_diff.filter(x=>x.getBoundingClientRect().width&&x.innerText.trim())
              if(!ds.length){
                return
              }else{
                _diff=ds
              }
              ds=_diff.filter(x=>x.innerText.trim().toLowerCase().startsWith(v.toLowerCase()))
              if(ds.length){
                _diff=ds
              }
              if(_diff.find(x=>{
                if(_Util._isInMenu(x,o)){
                  _domActionTask._doLog("Click menu: "+x.outerHTML)
                  $util.triggerMouseEvents(x,1,0,0,0,0,0,function(){
                    $util.triggerKeyEvents(dom,null,null,false,false,false,_afterFun);
                  })
                  return 1
                }
              })){
                return 1
              }
            }
          }
        }
      }catch(ex){
        _domActionTask._reportAppInfo("Set input 88: "+ex.message+"\n"+ex.stack)
      }
    }
  },
  //triggerBlurEvent
  triggerBlurEvent:function(o,_fun){
    setTimeout(function(){
      // var a=_IDE._data._curAction;
      // var os=$(o.ownerDocument.body).find("input")
      // for(var i=0;i<os.length;i++){
        // if(os[i]!=o&&!_Util._isHidden(os[i])){
          // $(os[i]).focus()
          // console.log(os[i])
          // return
        // }
      // }
      if(bzTwComm._isExtension()){
        _Util._getWindowFromDom(o).focus();
        var _path=_Util._getQuickPath(o)
        bzTwComm._postToApp({c:"var bzBlur=_Util._getElementByQuickPath('"+_path+"');try{$(bzBlur).blur()}catch(e){bzBlur&&bzBlur.blur()}"})
      }else{
        var _curWin=_Util._getWindowFromDom(o);
        $(o).blur();
        if(_curWin.angular){
          var e=_curWin.angular.element(o);
          if(e.blur){
            e.blur();
          }
          if(e.triggerHandler){
            e.triggerHandler("blur");
          }
        }
      }
      _fun&&_fun()
    },30)
  },
  //outerHTML
  outerHTML:function(o){
    if(o.outerHTML){
      return o.outerHTML;
    }
    var _win = _Util._getWindowFromDom(o);
    var box = _win.document.createElement("div");
    var n = o.nextSibling;
    var p=o.parentNode;
    box.appendChild(o);
    var rv=box.innerHTML;
    if(n){
      p.insertBefore(o,n);
    }else{
      p.appendChild(o);
    }
    
    return rv;
  },
  findDoms:function(p){
    let o=_Util._findDoms(p)
    return o.toArray?o.toArray():o
  },
  //findDom
  findDom:function(paths,_errOnHidden){
    var os=_Util._findDoms(paths,_errOnHidden)
    if(os){
      os=os[0]
    }
    return window.$element=os
  },
  //isDomExist
  isDomExist:function(p){
    return Boolean($util.findDom(p))
  },
  //nextKey
  nextKey:function(d,ck){
    var _bNext=!ck && ck!=0;
    for(var k in d){
      if(k==ck){
        _bNext=true;
      }else if(_bNext){
        return k;
      }
    }
    return null;
  },
  //findIFrame
  findIFrame:function(ii,n,d){
    d=d||BZ.TW;
    var i=0
    while(ii.length>i){
      var v=ii[i++]
      d=d.frames[v]
      if(!d){
        return
      }
    }
    return d.document
  },
  //getCurEnvironment
  getCurEnvironment:function(){
    var v= _Util._clone(BZ._curEnv)
    v.items.forEach((o,i)=>{
      let t=_aiAuthHandler._data[i]
      if(t){
        o.token=t.tokenValue
      }
    })
    return v;
  },
  getTokenByHostId:function(i){
    if(i===undefined){
      i=BZ._getCurTest()
      if(i){
        i=i._data.hostId
        i=_aiAuthHandler._getTokenHostIdxByUIHostIdx(i)
      }
    }
    return _aiAuthHandler._getToken(i||0)
  },
  setToken:function(v,i){
    if(v){
      if(v.constructor==String){
        v=v.trim()
        v.replace(/^authorization[^a-z0-1](.+)/i,"$1");
        v={
          Authorization:v
        }
      }
      if(i===undefined){
        i=_IDE._getDefaultAPIHostIdx()||0
      }
      _aiAuthHandler._setToken({
        tokenValue:v,
        _tokenHost:i
      })
    }
  },
  //removeToken
  removeToken:function(){
    $aiAPI.removeToken()
  },
  //getCurEnvironmentIdx
  getCurEnvironmentIdx:function(){
    return _IDE._data._setting.curEnvironment
  },
  //setEnvironment
  setEnvironment:function(v){
    _IDE._data._setting.curEnvironment=v
    BZ._curEnv=_IDE._data._setting.environments[v];
    _extensionComm._setShareData({"BZ._curEnv":BZ._curEnv,"_IDE._data._setting.curEnvironment":_IDE._data._setting.curEnvironment})
  },
  //getCoopStatus
  getCoopStatus:function(d,n){
    return _cooperatorHandler._getCoopStatus(d,n)
  },
  //getCoopStatus
  getCoopStatus:function(d,n){
    return _cooperatorHandler._getCoopStatus(d,n)
  },
  //getCoopStatus
  getCoopStatus:function(d,n){
    return _cooperatorHandler._getCoopStatus(d,n)
  },
  //getCoopKey
  getCoopKey:function(){
    return _cooperatorHandler._data.inService?_cooperatorHandler._data.key:0
  },
  //getCoopScope
  getCoopScope:function(){
    return _cooperatorHandler._data.inService?_cooperatorHandler._data.scope:""
  },
  //getCoopGroup
  getCoopGroup:function(){
    return _cooperatorHandler._data.inService?_cooperatorHandler._data.group:""
  }
}

//Remove output function content
for(k in $util){
  $util[k].toString=function(){}
};/*
  For get customer app info from extension
*/
window.bzTwComm={
  _reloadInfo:[],
  _tmpId:Date.now(),
  _list:[],_exeList:[],
  _doing:0,
  appReady:window.name.includes("bz-master"),
  //_world,_frameId,d,ev, _scope, _fun, _args, bktg, _bkfun, _bkscope
  // tg (target):
  //    1, app: page, 
  //    2, ext: extension
  //    3, ide: 
  // frameId:0: top, element path: iframe, *: all
  // operation options:
  //    1, d: to set data
  //    2, ev: to eval script
  //    3, scope, fun, args
  // bt (callback target): bt
  // _bkscope (callback function scope)
  // _bkfun (callback function): 
  //    1, Function
  //    2, script
  // _async:
  _postRequest:function(v){
    if(bzTwComm._isIDE()&&BZ._closed){
      return
    }
    v.org=JSON.stringify(v)
    bzTwComm._list.push(v)
    if(!bzTwComm._getExtensionId()){
      console.log("BZ-LOG:Missing extension id")
    }else if(!bzTwComm.ideId){
      console.log("BZ-LOG:Missing ide id")
    }else if(!bzTwComm.appId&&bzTwComm._isExtension()){
      console.log("BZ-LOG:Missing app id")
    }else{
      return _doIt()
    }

    return setTimeout(()=>{
      _doIt()
    },100)

    function _doIt(){
      if(bzTwComm._doing){
        return
      }
      bzTwComm._doing=v=bzTwComm._list.shift()
      if(!v){
        return
      }
      let vv=v
      v.bz=1
      v.bktg=bzTwComm._getWorld()
  
      let k,_ckTimer
      v._args=v._args||[]
      try{
        v._bkfun=v._bkfun||v._args.find(x=>x&&x.constructor==Function)
        if(v._bkfun&&v._bkfun.constructor==Function){
          let _idx=v._args.indexOf(v._bkfun)
          let f=v.bktg+bzTwComm._newId()
          let ff=v._bkfun
          window[f]=function(){
            clearTimeout(_ckTimer)
            delete window[f]
            ff(...arguments)          
          }
          v._bkfun=f
          if(_idx>=0){
            v._args[_idx]=f
          }
          if(v._ckTimer){
            _ckTimer=setTimeout(()=>{
              if(window[f]){
                delete window[f]
              }
            },v._ckTimer)
          }
        }

        if(bzTwComm._isIDE()){
          v.toId=bzTwComm.appId
          v.fromId=bzTwComm.ideId
        }else{
          v.toId=bzTwComm.ideId
          v.fromId=v.appId
          v.fromFrameId=bzTwComm.frameId
        }
        if(bzTwComm._isIDE()){
          return chrome.runtime.sendMessage(bzTwComm._getExtensionId(), v,r=>{
            if(!r){
              console.log("Missing response: "+r)
              console.log(vv)
            }

            bzTwComm._doing=0
            _doIt()
          });
        }else if(bzTwComm._isExtension()&&(v.tg=="ide"||v.tg=="bg")){
          chrome.runtime.sendMessage(v,r=>{
            if(!r){
              console.log("Missing response: "+r)
              console.log(vv)
            }
            bzTwComm._doing=0
            _doIt()
          });
          return
        }
        k=bzTwComm._isExtension()?"app":"ext"
        document.documentElement.setAttribute("bz-to-"+k+"-"+bzTwComm._newId(),JSON.stringify(v))
        bzTwComm._doing=0
        _doIt()
      }catch(ex){
        window.createErrMark&&window.createErrMark("Post data error")
        console.log(ex.stack)
        bzTwComm._list.unshift(vv)
        bzTwComm._doing=0
        _doIt()
      }
    }
  },
  _addFailActionInfo:function(a){
    let t=BZ._getCurTest()
    let o=bzTwComm._reloadInfo[bzTwComm._reloadInfo.length-1]
    if(o){
      o._failedTime=Date.now()
      o._failedTest=_IDE._getShortcutKey(".",t)
      o._failedAction=t._data.actions.indexOf(a)
    }
  },
  touchIDE:function(){
    if(!BZ._closed){
      let t=BZ._getCurTest(),
          a=_IDE._data._curAction
      bzTwComm._reloadInfo.push({
        _reloadTime:Date.now(),
        rt:t?_IDE._getShortcutKey(".",t):"",
        ra:a?t._data.actions.indexOf(a):-1
      })
      console.log("BZ-LOG: reload data for background")
      _extensionComm._setStartScript()
      _extensionComm._setShareData()
      chrome.runtime.sendMessage(bzTwComm._getExtensionId(),{status:BZ._data._status},r=>{})
      chrome.runtime.sendMessage(bzTwComm._getExtensionId(),{bzCode:1},r=>{})
      return {ideId:bzTwComm.ideId,appId:bzTwComm.appId}
    }
  },
  _newId:function(){
    return bzTwComm._tmpId++
  },
  setAppInfo:function(d){
    Object.assign(bzTwComm,d)
  },
  _getWorld:function(){
    return bzTwComm._world=bzTwComm._world||(bzTwComm._isIDE()?"ide":bzTwComm._isExtension()?"ext":"app")
  },
  init:function(i){
    return this._init(i)
  },
  setRequest:function(v){
    if(bzTwComm._isIDE()&&BZ._closed){
      return
    }
    return bzTwComm._exeRequest(v)||1
  },
  _isIDE:function(){
    return window.name=="bz-master"&&!window.extensionContent
  },
  _isExtension:function(){
    return window.name!="bz-master"&&window.extensionContent
  },
  _isApp:function(){
    return bzTwComm._isTopApp()||bzTwComm.frameId
  },
  _isTopApp:function(){
    return window.name.includes("bz-client")
  },
  _getExtensionId:function(){
    return bzTwComm.bzExtensionId=bzTwComm.bzExtensionId||window.extensionContent||document.documentElement.getAttribute("bz-id")
  },
  _init:function(i){
    if(!bzTwComm.bzExtensionId){
      bzTwComm.bzExtensionId=bzTwComm._getExtensionId();
      if(!bzTwComm._isIDE()){
        bzTwComm.frameId=i||0
        console.log("_init comm .. "+window.extensionContent+":"+i)
        if(bzTwComm._isApp()){
         _TWHandler._takeoverAjax(window)
         _TWHandler._takeoverOpenWin()
         _TWHandler._takeoverCanvas()
        }
        console.log("monitor ...")
        console.log(bzTwComm._isExtension()?"ext":"app")
        bzTwComm._monitorInfo()

        if(bzTwComm._isExtension()){
          window.onhashchange=function(){
            bzTwComm._postToIDE({_fun:"_infoPageReady",_scope:"_extensionComm"})
          }

          setTimeout(function(){
            var as=document.getElementsByTagName("a");
            for(var i=0;i<as.length;i++){
              _Util._removeLinkTarget(as[i])
            }
          },100)
        }

        if(bzTwComm._isTopApp()){
          bzTwComm._postToIDE({_fun:"_setBZSent",_args:[{i:0,_root:1}],_scope:"_TWHandler"});
        }

        _postReady()
    
        function _postReady(){
          if(!window._domRecorder||(bzTwComm._isExtension()&&!window.curUser)||!bzTwComm.ideId||(bzTwComm._isExtension()&&(!window.BZ||!window._IDE||!window._IDE._data._setting||!window._IDE._data._setting.content))){
            bzTwComm._chkTime=bzTwComm._chkTime||Date.now()
            if(bzTwComm._isExtension()&&Date.now()-bzTwComm._chkTime>3000){
              bzTwComm._chkTime=0
              chrome.runtime.sendMessage({tg:"bg",reqData:1},r=>{
                if(!r){
                  console.log("Missing response: "+r)
                }
                BZ._setShareData(r)
              });
            }
            if(bzTwComm._isExtension()){
              window.createErrMark&&window.createErrMark("Page is not ready")
            }
            return setTimeout(()=>{
              _postReady()
            },100)
          }
          bzTwComm._chkTime=0
          bzTwComm.appReady=1
          window.removeErrMark&&window.removeErrMark()
          console.log("page is ready")
          bzTwComm._postToIDE({_fun:"_infoPageReady",_scope:"_extensionComm"});
        }
    
      }
    }
  },
  _monitorInfo:function(){
    //for content send code to app page
    if(!bzTwComm._infoObserver){
      bzTwComm._infoObserver= new MutationObserver(function(vs) {
        vs.forEach(function(v) {
          v=v.attributeName
          _handle(v)
        });
      })
      bzTwComm._infoObserver.observe(document.documentElement,{attributes: true});
      let os=document.documentElement.attributes
      for(let i=os.length-1;i>=0;i--){
        _handle(os[i].name)
      }
    }

    function _handle(v){
      if(v){
        bzTwComm._exeList.push(v)
      }
      if(!bzTwComm.appReady){
        return setTimeout(()=>{
          _handle()
        },10)
      }
      v=bzTwComm._exeList.shift()
  
      let d=document.documentElement.getAttribute(v)
      if(d){
        let vv=v.match(/^bz-to-(app|ext)-/)
        if(vv&&((vv[1]=="app"&&!bzTwComm._isExtension())||(vv[1]=="ext"&&bzTwComm._isExtension()))){
          document.documentElement.removeAttribute(v)
          try{
            d=JSON.parse(d)
            if(d.tg=="ide"){
              bzTwComm._postToIDE(d)
            }else{
              bzTwComm._exeRequest(d)
            }
          }catch(e){
            $util.log(JSON.stringify(d)+"\n\n"+e.stack)
          }
        }
      }
    }
  },
  _exeRequest:function(v){
    let r;
    if(v._scope){
      v._args=v._args||[]
      let d=_getPathData(v._scope+"."+v._fun)
      if(v._bkfun){
        let _idx=v._args.indexOf(v._bkfun)
        if(_idx>=0){
          v._args[_idx]=function(){
            _doCallback(...arguments)
          }
          return d.d[d.k](...v._args)
        }
      }
      if(!d.d[d.k]||d.d[d.k].constructor!=Function){
        console.log("Missing function")
        console.log(d)
        console.log(v)
      }
      r=d.d[d.k](...v._args)
    }else if(v.d){
      Object.keys(v.d).forEach(k=>{
        let vv=v.d[k],
            d=_getPathData(k)
        let o=d.d[d.k]
        if(!o||o.constructor!=Object||!vv||vv.constructor!=Object){
          d.d[d.k]=vv
        }else{
          Object.keys(vv).forEach(k=>{
            d.d[d.k]=vv[k]
          })
        }
      })
    }else{
      r=_Util._eval(v.c)
    }
    return _doCallback(r)

    function _doCallback(){
      if(v._bkfun){
        v={
          _scope:v._bkscope||"window",
          _fun:v._bkfun,
          _args:[...arguments],
          tg:v.bktg
        }
        bzTwComm._postRequest(v)
      }
      return arguments[0]
    }

    function _getPathData(k){
      let ks=k.split(".")
      k=ks.pop()
      let d=window
      ks.forEach(x=>{
        d=d[x]||{}
      })
      return {d:d,k:k}
    }
  },
  _postToApp:function(d){
    d.tg="app"
    bzTwComm._postRequest(d)
  },
  _postToGb:function(d){
    d.tg="bg"
    bzTwComm._postRequest(d)
  },
  //For recording alert/confirm message
  _postToIDE:function(d){
    d.tg="ide";
    bzTwComm._postRequest(d)
  },
  _postToExt:function(d){
    d.tg="ext";
    bzTwComm._postRequest(d)
  },
  _postToBg:function(d){
    d.tg="bg"
    bzTwComm._postRequest(d)
  },
  _postToPage:function(d){
    d.tg="app,ide"
    bzTwComm._postRequest(d)
  },
  _insertData:function(d){
    if(!document.body){
      return setTimeout(()=>{
        bzTwComm._insertData(d)
      },1)
    }
    var o = document.getElementById("bz-area");

    if(!o){
      o=document.createElement("div")
      o.id="bz-area"
      o.style.display="none"
      document.body.parentElement.append(o)
    }
    if(o){
      if(o.innerHTML){
        setTimeout(()=>{
          bzTwComm._insertData(d)
        },0)
      }else{
        o.innerText=JSON.stringify(d)
      }
    }
  }
};
if((window.name=="bz-master"&&!window.extensionContent)||(window.extensionContent&&window.name.includes("bz-client"))){
  bzTwComm._init()
};;bzTwComm.init(curIframeId);}if(window.name.includes("bz-client")){insertAppCode()}