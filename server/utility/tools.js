var tools={
    splice:function(array,e){
        if(!array||array.length==0||!e){
            return;
        }
        var index=array.indexOf(e);
        if(index>-1){
            array.splice(index,1);
        }
    }
};
module.exports=tools;