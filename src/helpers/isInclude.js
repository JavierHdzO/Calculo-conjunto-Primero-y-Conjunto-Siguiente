export const isIncludeVar = ( cadena = "", list_var = [] ) => {
    let miIndex = -1
    list_var.forEach( ( variable, index ) => {
        if ( cadena.includes(variable)) {
            
            if( cadena.indexOf(variable) === 0){
                miIndex =  index
            }
        }
    })

    return miIndex
}


export const isIncludeTerm = ( cadena = "", list_ter = [] ) => {

    let miIndex = -1
    list_ter.forEach( ( terminal, index ) => {
        if ( cadena.includes(terminal)) {
            
            
            if( cadena.indexOf(terminal) === 0){

                miIndex =  index
            }
        }
    })

    return miIndex
}

