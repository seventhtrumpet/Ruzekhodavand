// Load profile logo in 2 chunks then apply
(function(){
  var n=2, loaded=0;
  function next(){
    if(loaded>=n){
      var a=document.createElement('script');
      a.src='js/logo_assemble.js';
      a.onload=function(){
        if(!document.querySelector('script[data-site-logo]')){
          var s=document.createElement('script');
          s.src='js/site_logo.js';
          s.setAttribute('data-site-logo','1');
          document.body.appendChild(s);
        }
      };
      document.body.appendChild(a);
      return;
    }
    var s=document.createElement('script');
    s.src='js/logo_p'+loaded+'.js';
    s.onload=function(){loaded++;next();};
    s.onerror=function(){loaded++;next();};
    document.body.appendChild(s);
  }
  next();
})();
