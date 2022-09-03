import { isIncludeVar, isIncludeTerm } from "../helpers/isInclude"


export const recursive = (vertical_varRule,head, primeros = {}, produccion_rules = {}, list_Terminal, repeticiones,   stop)  => {

    let set = new Set();
    let answer = []
    let indexInclude = -1

    repeticiones[head]++

    console.log(head);

    if( !stop ){
        if(head  == "P") console.log("entro aqui x1");
        return [""];

    }
    else if( produccion_rules[head] ){
        
        // if(head  == "P") console.log("entro aqui x2");

        // if( primeros[head] &&  primeros[head].length > 0){
        //     primeros[head].forEach( first => {
        //         set.add(first)
        //     });
            
        //     if(head  == "P") console.log("entro aqui x3");
        //     console.log("entro z");
        //     return [...set]

        // }
        // else{
            
            if(head  == "PN") console.log("entro aqui x4");
            let head_rule = head
            let body_rule = produccion_rules[head]
            
            
            for (let j = 0; j < body_rule.length; j++) {
                
                

                indexInclude = isIncludeVar(body_rule[j], vertical_varRule);
    
                if (indexInclude === -1) {
    
                  indexInclude = isIncludeTerm(body_rule[j], list_Terminal);
    
                  if (indexInclude != -1) {
                    set.add(list_Terminal[indexInclude])
                  }
                  else if(body_rule[j].trim() === "$"){
                    set.add(body_rule[j])
                  } 
                  else {
                    /**
                     * Cuando la caden empieza con un terminal no definido en el conjunto de terminales
                     */

                    // list_Terminal.push(body_rule[j][0])
                    set.add(body_rule[j][0])
    
                  }
    
                } else {
                  /**
                   * Cuando la cadena si empiece con una Variable
                   * 
                   */
                    
                    if(repeticiones[head] > 1){
                        answer =  recursive(vertical_varRule, vertical_varRule[indexInclude], primeros, produccion_rules, list_Terminal, repeticiones, false )

                        answer.forEach( d => {
                            if(d !== "")
                            set.add(d)
                        })
                    }else{

                        answer =  recursive(vertical_varRule, vertical_varRule[indexInclude], primeros, produccion_rules, list_Terminal,  repeticiones, true )

                        answer.forEach( d => {
                            if(d !== "")
                            set.add(d)
                        })
                    }
    
    
    
                }

                

            }

            

            return [...set]
            
        // }


    }else{

        
        /**
         * break
         * return
         */
        return ["#"]
    }


}