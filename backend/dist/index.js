import n from"express";var s=n();s.get("/",(t,o)=>{o.send("Hello dhnkj")});var e=process.env.PORT??"3000";s.listen(e,()=>{console.log(`Server is starting to listen on ${e}`)});
