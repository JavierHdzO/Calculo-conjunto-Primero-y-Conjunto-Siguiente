import { isIncludeStrict } from '../helpers/isInclude'

/**
 * 
 * @param {*} produccion_rules 
 * @param {*} list_variables 
 * @param {*} original_head 
 * @returns 
 */
export const getString = ( produccion_rules, list_variables, original_head ) => {

    const produccion_strings = {}
    for (let i = 0; i < produccion_rules.length; i++) {

        
        const head = produccion_rules[i][0];
        const body = produccion_rules[i][1];

        
        produccion_strings[head] = []
        for (let j = 0; j < body.length; j++) {
            
            if ( isIncludeStrict(body[j], original_head) != -1 ){
                produccion_strings[head].push(body[j]);
            }
            
        }

        

        if(produccion_strings[head].length === 0){
            delete produccion_strings[head];
        }
        
    }

    return produccion_strings

}