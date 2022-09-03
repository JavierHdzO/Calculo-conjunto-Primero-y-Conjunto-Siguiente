import { isInclude } from "../helpers/isInclude"

/**
 * 
 * @param {*} vertical_varRule List: de variables con las que se inica cada una de las reglas de produccion 
 * @param {*} head  String: indica que varaible es la que se quiere resolver 
 * @param {*} produccion_rules Onject: es una estructura objeto que contiene todas las reglas de producción, cada una tiene como llave principal la variable de la regla de produccion y como contenido un array con las reglas a evaluar
 * @param {*} list_Terminal List: Es un array con todos los simbolos Terminales especiales
 * @param {*} repeticiones Object: Es una estructura objeto que contiene cada Variable de la reglas de producción, siendo esta su llave y como contenido un entero que sirve como contador para conocer cuantas veces dicha varaible a sido llamada para entrar en la recursión 
 * @param {*} stop Boolean: Es la varaible de paro para detener la recursion
 * @returns - Array - Se retorna un array con las uniones de la evaluación de las reglas de producción que fueron encontradas por la recursión
 */
export const recursive = (vertical_varRule,head, produccion_rules = {}, list_Terminal, repeticiones,   stop)  => {

    let set = new Set();
    let answer = []
    let indexInclude = -1

    /**
     * Se incremente el contador de la varaible que se encuentra en recursión
     */
    repeticiones[head]++

    console.log(head);

    /**
     * Si la variable stop tiene como contenido false, indica que la recursión se ha detenido, porque se cumpli con 
     * la condición de paro.
     * Al no haber ninguna otra varaible a añadir al conjunto de resultado, se envia un arreglo con un string vacio.
     */

    if( !stop ){
        return [""];
    }
    /**
     * Si la condición de para no se cumple aún
     * Se debe verificar si la variable que se esta evaluando se encuetra entre las variables de las reglas de producción
     * debido a que en ocasiones puede haber variables que no se encuetren en ellas y no se debe continuar en profundidad 
     * con la recursión.
     */
    else if( produccion_rules[head] ){
        
        
            /**
             * Se asigna las reglas de producción a evaluar para su union aplicando la tercera regla a una varaible
             * llamada body_rule, con el fin de ser mas facil su obtenición
             */
            let body_rule = produccion_rules[head]
            
            
            for (let j = 0; j < body_rule.length; j++) {
                
                

                indexInclude = isInclude(body_rule[j], vertical_varRule);
    
                if (indexInclude === -1) {
    
                  indexInclude = isInclude(body_rule[j], list_Terminal);
    
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
                   * Cuando el contado de la variable que se esta evaluando sea mayor a 1, significa que se entrata a una recursión
                   * infitinica, por lo que ya no es necesario seguir con dicha recursión y se debe deter, para la unión de todos los
                   * resultado obtenidos durante la evaluación, se envia stop = false
                   * 
                   */
                    
                    if(repeticiones[head] > 1){
                        answer =  recursive(vertical_varRule, vertical_varRule[indexInclude], produccion_rules, list_Terminal, repeticiones, false )

                        /**
                         * Se agregan los resultados obtenidos en la estructura set ( para descartar los simbolos repetidos), la condición impide que se agreguen
                         * cadenas de texto vacias
                         */
                        answer.forEach( d => {
                            if(d !== "")
                            set.add(d)
                        })
                    }else{
                        /**
                         * Se puede seguir con la recursión, debido a que no se ha llegado al limite de la recursión (no se encuentra en peligro de entrar en un
                         * ciclo infinito)
                         */
                        answer =  recursive(vertical_varRule, vertical_varRule[indexInclude], produccion_rules, list_Terminal,  repeticiones, true )

                        /**
                         * Se agregan los resultados obtenidos en la estructura set ( para descartar los simbolos repetidos), la condición impide que se agreguen
                         * cadenas de texto vacias
                         */
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
         * Si la variable no se encuentra en las variables de que producen las reglas de producción, entonces se regresa 
         * un conjunto vacio denotado por "#"
         */

        return ["#"]
    }


}