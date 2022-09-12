/**
 * @param {*} cadena String - Es una cadena de texto perteneciente a una regla de proudccion
 * @param {*} list_var Array - Contiene las variables o terminales especiales
 * @returns -1 Si no inicia con una variable o terminal especial, caso contrario se retorna el indice de la variable 
 * o Terminal especial con el que se identifico que inicia la cadena (el indice se otorga con base al orden del Array 
 * que se proporciona)
 */
export const isInclude = ( cadena = "", list_var = [] ) => {
    let miIndex = -1
    /**
     * Esta función pretende identificar si la cadena que se esta evaluando comienza en 
     * su posición 0 con una variable o terminal especial ( Esto depende de los argumento que se
     * le envie al llamar a esta función)
     */
    list_var.forEach( ( variable, index ) => {
        if ( cadena.includes(variable)) {
            
            if( cadena.indexOf(variable) === 0){
                miIndex =  index
            }
        }
    })

    return miIndex
}

/**
 * 
 * @param {*} cadena es la cadena de producción a la que se le quiere localizar si contiene una variable
 * @param {*} variable es aquella que se quiere localizar dentro de la cadea
 * @returns return -1 si no la cadena no contiene la variable buscada, en caso contrario se retorna el 
 * indice de la variable
 */
export const isIncludeStrict = (cadena = "", variable  = "") => {

    /**
     * Esta función trara de evitar que se confunda X o X' (Otros Ej. Y con Y', Z con Z', A con A', etc) cuando se busque alguna variable 
     */

    /**Se debe obtener en INDEX el indiece de la varaible dentro e la cadena */
    const index = cadena.indexOf( variable)
    if( index != -1 ){

        /** Si INDEX tiene el indice de la varaible, entonces ahora a se busca dicha variable pero concatenando ', esto porque
         * si se manda una X, posiblemente la cadena tenga abcX'a, por lo que se podria confundir. Entonces a cada varaible se le debe buscar 
         * su ' (prima).
         * 
         */

        /**
         * Se busca la ' (varaible prima) dentro de la cadena si no se encuentra debe dar -1, si se encuentra debe dar el indice de donde se 
         * encuentre.
         * 
         * El indice de la varaible deber ser diferente al indice de la variable prima, esto indica que no se confunden dichas variables dentro
         * de la cadena. Indicando que si existe la variable buscada.
         */
        const index2 = cadena.indexOf( variable+"'" );
        if( index != index2){
            return index;
        }

    }
    
    return -1;
}
