var time = [ 7, 5, 5, 5, 5, 10, 7 ];
let money ;
let result = 0;



for (let i=0; i < time.length; i++) {
   switch(time[i]){
       case time[0],time[1],time[2],time[3]:
           money =4500;

    case time[4],time[5],time[6]:
               money =5200;

   }
   
     result +=(money*time[i]);
}
     
console.log("1주일간의 전체 급여: " + result + "원");