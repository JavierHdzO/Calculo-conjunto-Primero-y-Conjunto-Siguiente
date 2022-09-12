
<template>

  <div v-if="!isCalculating" class="inputs">
    <div>
      <label>Agregar Variable</label>
      <input @keyup.enter="addVariable" v-model="variable" type="text" placeholder="Enter para ingresar Variable">
    </div>

    <div v-if="!isCalculating">
      <label>Agregar Terminales</label>
      <input @keyup.enter="addTerminal" v-model="terminal" type="text" placeholder="Enter para ingresar Variable">
    </div>

  </div>
  <br>
  <div>
    <label> Variables</label>
    <p>V = {{ list_Variable }}</p>
    <label> Terminales </label>
    <p>T = {{ list_Terminal }}</p>
    <label>Simbolo Inicia</label>
    <p v-if="produc_rule_Test.length > 0">S = {{ produc_rule_Test[0][0] }}</p>
  </div>

  <div v-if="!isCalculating" class="rules">
    <label>Reglas de produccion</label>
    <div>
      <input v-model="simVariable" id="variable" type="text" placeholder="var"> =>
      <input v-model="cadenasProduccion" @keyup.enter="addRule" id="cadenas" type="text">
      <button @click="addRule" id="add-rule">Cerrar regla</button>
    </div>

  </div>
  <br>
  <p v-for=" (product, index)  in produc_rule_Test" :key="index">
    {{ product[0] }} => {{ product[1] }}
  </p>
  <br>
  <button v-if="produc_rule_Test.length != 0  && !isResolved" class="btn-success" @click="calculate">Primero</button>
  <button v-if="isResolved" class="btn-success" @click="  invert ">Siguiente</button>
  <br>

  <template v-if="isResolved ">
    <h1>Conjunto Primero</h1>
    <div v-for="body_resp, index in dict_produccion_rule" :key="index">
      <table class="table">
        <thead class="bg-primary text-white">
          <th class="table-dark"> {{ index }} </th>
        </thead>
        <tbody v-for="primer, index_b in body_resp" :key="index+index_b" class="table-light">
          <tr>
            <td>Primero({{primer}}) = { {{ getPrimerAnswer(index, index_b) }} }</td>

          </tr>
        </tbody>
      </table>
    </div>
  </template>

  <template v-if="isResolvedNext">
    <br>
    <h1>Conjunto Siguiente</h1>
    <div v-for="variable in list_Variable" :key="variable">
      <table class="table">
        <thead class="bg-primary text-white">
          <th class="table-dark"> {{ variable }} </th>
        </thead>
        <tbody class="table-light">
          <tr>
            <td>Siguiente({{ variable }}) = { {{ getNextAnswer( variable) }} }</td>

          </tr>
        </tbody>
      </table>
    </div>
  </template>
  <button v-if="isResolved || isResolvedNext" @click="clean" class="btn-success">
    Limpiar
  </button>

</template>

<script>
import { computed } from 'vue'
import { ref } from 'vue'
import { isInclude } from '../helpers/isInclude'
import { recursive } from '../helpers/recursive'
import getAllTernminales from '../helpers/terminales'
import { getString } from '../helpers/getStrings'

export default {
  name: 'Calculo',
  setup() {

    //Conjunto Primero

    const variable = ref('')
    const terminal = ref('')
    const list_Variable = ref([])
    const list_Terminal = ref([])
    const produc_rule_Test = ref([])
    const simVariable = ref('')
    const cadenasProduccion = ref('')
    const isCalculating = ref(false)
    let produccion_rules = []
    const dict_produccion_rule = ref({})
    let vertical_varRule = []
    const primeros = ref({})
    const isResolved = ref(false)
    const isResolvedNext = ref(false)


    //Conjunto Siguiente
    const siguiente = ref({})



    const simplifyNext = () => {
      /**
       * Esta funcion tiene como objetivo eliminar todas las variables que se tengan 
       * en los conjunto siguiente de cada variable. Sustituyendolas por el conjunto
       * siguiente de dicha variable.
       */

      let setSimplifyNext;


      for (let i = 0; i < list_Variable.value.length; i++) {
        /**
         * Se iteran todas las variables almacenadas en list_Variable
         * 
         * en HEAD se almacena la varaible
         * 
         * en BODY se almacena la lista con los resultados del conjunto Siguiente para la varaible HEAD
         */
        const head = list_Variable.value[i]
        const body = siguiente.value[head]

        /**
         * Se crea un conjuto programatico de los resultados que se tienen en SIGUIENTE para la variable HEAD
         */
        setSimplifyNext = new Set(body);


        /**
         * Se itera cada simbolo que se contiene en el conjunto SIGUIENTE para la variable HEAD
         */
        for (let j = 0; j < body.length; j++) {

          /**
           * Se quiere saber si el simbolo iterado no es un simbolo terminal,
           * esto sirve para saber si es una variable y poder cambiar su valor.
           * 
           * Se retorna -1 si no es un simbolo termina (este dato indica que es una Variable), en caso contrario
           * retorna un indice con respecto de list_Terminal si es un terminal
           */
          const indexInclude = isInclude(body[j], list_Terminal.value)

          /**
           * Si es una variable y dicho simbolo es diferente de $ 
           */
          if (indexInclude === -1 && body[j] !== "$") {
            console.log(body[j]);


            const head_Child = body[indexInclude]

            /**
             * Se obtiene el conjunto siguiente de la variable que se encontró en el conjunto Siguiente de HEAD
             */
            const body_variableHijo = siguiente.value[body[j]]

            /**
             * Se itera dihca lista con el conjunto de la varaible dicho en el paso anterior
             * el dato debe ser diferente a la variable HEAD, para evitar que se sigan concatenando variables en los
             * conjunto Siguiente y dar una respuesta final
             * 
             * Si no son iguales el dato iterado y el HEAD entonces se agrega al conjunto Siguiente de HEAD
             */
            body_variableHijo.forEach(data => data != head ? setSimplifyNext.add(data) : "")

            /**
             * Se elimana la varaible encontrada del conjunto Siguiente del HEAD
             */
            setSimplifyNext.delete(body[j])


          }

        }

        /**
         * Se remplaza el conjunto Siguiente de HEAD obtenido en la función Next que contiene varaible en dicho conjunto, 
         * por el nuevo conjunto Siguiente para HEAD, pero simplificado sin variables.
         */
        siguiente.value[head] = [...setSimplifyNext]

        /**
         * Se limplia el conjunto programatico, para analizar la siguiente varaible y poder simplificar sus conjunto Siguiente
         */
        setSimplifyNext.clear()
      }

      console.log(siguiente.value);
    }

    const next = () => {

      console.log(produccion_rules);

      let setNext;
      let indexInclude = -1;
      let body_beta = ''


      /**
       * Se debe iterar cada varaible del conjunto ed reglas
       */
      for (let i = 0; i < list_Variable.value.length; i++) {

        //HEAD - es la varaible que se está iterando
        const head = list_Variable.value[i];
        console.log(head);

        /**
         * production?String retorna un objeto con las variables con las reglas de producion que
         * incluyan a la variable head
         */
        const production_strings = getString(produccion_rules, list_Variable.value, head)

        /**
         * Para iterar más facil del objeto se obtienen las keys o claves y se guardan en keys
         */
        const keys = Object.keys(production_strings)


        /**
         * Como list_Variable.value[0] es el simbolo inicial, se compara si la variable HEAD
         * es la misma, para cumplir con la REGLA 1 del calculo del conjunto Siguiente.
         * 
         * Si se cumple la regla se agrega un $ al conjunto Siguiente, en caso contrario se deja vacio.
         * 
         * Tambien nos ayuda a inicializar el objeto SIGUIENTE que almacenara todas los resultados finales
         */
        if (head === list_Variable.value[0]) {
          siguiente.value[head] = ["$"]
        } else {
          siguiente.value[head] = []
        }

        setNext = new Set()


        /**
         * Se comienza con la iteracion de cada variable del conjunto de reglas.
         */
        for (let j = 0; j < keys.length; j++) {
          /** KEY - Se almacena la Variable de la primer regla de produccion que contiene  al la varaible HEAD */
          const key = keys[j]
          /** BODY - Almacena una lista con las cadenas de la regla de producción que tengan como llave a KEY */
          const body = production_strings[key]

          console.log(key);


          /**Se itera la cadenas de producción que se tienen que contienen a la variable  HEAD dentro de ellas */
          for (let k = 0; k < body.length; k++) {

            const indexHead = body[k].indexOf(head);


            /**Se debe saber si la varaible HEAD esta al final de la cadena, para saber si se aplica la REGLA 2 o REGLA 3 del calculo del conjunto siguiente */
            if (indexHead + head.length - 1 !== body[k].length - 1) {
              /**
               * ESTE CUERPO DEL IF, es cunado la variable HEAD no está al final de la cadena.
               * 
               * SE APLICA LA REGLA 2 DEL CALCULO DEL CONJUNTO SIGUIENTE
               */

               /**  Ser cupera la cadena restante desde la variable HEAD hasta el fin de ella. */
              body_beta = body[k].substring((indexHead + head.length - 1) + 1)

              /** 
               * INDEXINCLUDE
               * Se analiza si la subcadena recuperada inicia  con un simbolo terminal o con una variable
               * 
               * retorna -1 si no se encuentra ninguna variable en la cadena.
               *            o se retorna el indice de la varaible dentro de list_Variable
              */
              indexInclude = isInclude(body_beta, list_Variable.value);


              if (indexInclude === -1) {
                /**
                 *  INDEXINCLUDE
                 * 
                 *  Se quiere saber si la subcadena comienza con un simbolo terminal ya almacenado en list_Terminal
                 *  Retorna -1 si no se encuentra dicho simbolo terminal o el indice del terminal con referencia a list_Terminal
                 */
                indexInclude = isInclude(body_beta, list_Terminal.value);

                if (indexInclude != -1) {
                  
                  /**
                   * Si se encontro el terminal
                   * 
                   * Se agrega dicho terminal al conjunto Siguiente de la variable HEAD
                   */
                  setNext.add(list_Terminal.value[indexInclude])
                }

                else if (body[j].trim() === "@") {

                  /**
                   * Si se obtiene un cadena vacia detonada por @, significa que se adapta a la REGLA 3 del
                   * Calculo del Conjunto Siguiente
                   * 
                   * 
                   * Se debe agregar KEY que es la varaible que contiene la regla donde en su cadena se encontro HEAD,
                   * para al finalizar este proceso se proceda a su simplificacion
                   */
                  
                   setNext.add(key)
                   
                  // if (siguiente.value[key]) {
                  //   setNext.add(key)
                  // } else {
                  //   const getSiguiente = siguiente.value[key]
                  //   getSiguiente.forEach(data => key !== head ? setNext.add(data) : "")
                  // }

                }
                else {
                  /**
                   * Si no se encontro ningun terminal parecido, se agreega al conjunto Siguiente de la variable HEAD.
                   */
                  setNext.add(body[k][0]);

                }

              } else {

                /**
                 * CUANDO subcadena comienza con una VARIABLE dentro de list_Varaible, se obtiene mediante el indice 
                 * almacenado en INDEXINCLUDE
                 * 
                 * Se obtiene el conjunto Primero para la VARAIBLE  que previamente se obtuvo, aplicando el calculo del conjunto Primero a
                 * todas las reglas de produccion y que sus resultados se almacenan en la variable PRIMEROS
                 */
                
                const variable = list_Variable.value[indexInclude]
                const primerVar = [].concat(...primeros.value[variable])

                /**
                 * Se itera cada posición de la lista que se obtuvo en PRIMERVAR, y se van agregando al conjunto Siguiente
                 * de HEAD, a excepción de las cadenas vacias que se puedan encontrar denotadas por @, debido a que estas 
                 * se ajustan a la REGLA 3. Cuando se encuentra un @ se agrega la varaible KEY al conjunto SIguiente de HEAD.
                 * 
                 * EN OTRO PROCESO SE SIMPLIFICARAN LAS VARAIBLES QUE SE VAYAN AGREGANDO A LOS CONJUNTOS SIGUIENTES, PARA DAR
                 * SOLUCIÓN FINAL
                 */
                primerVar.forEach(value => value !== "@" ? setNext.add(value) :
                  key !== head ? setNext.add(key) : "")

              }

            } else {
              /**
               * Cuando la variable HEAD se encuentra al final de la cadena de la regla de producción,
               * significa que se ajusta a la REGLA 2.
               * 
               * Unicamente se agrega la variable KEY al conjutno Sigueinte e la variable HEAD.
               * 
               * EN OTRO PROCESO SE SIMPLIFICARAN LAS VARAIBLES QUE SE VAYAN AGREGANDO A LOS CONJUNTOS SIGUIENTES, PARA DAR
               * SOLUCIÓN FINAL
               */
              setNext.add(key)

            }

          }

        }

        /**
         * Todo el simbolos se almacenan en el cojunto programatico setNext, para que no se repitiera ningun simbolo,
         * se convierte en lista, para poder iterar sobre él.
         */
        const res = [...setNext]

        /**
         * Se itera cada simbolo que se obtuvo para el conjunto Siguiente ed HEAD, y se va agregando al objeto SIGUIENTE
         * que almacena todas las soluciones para el CALCULO DEL CONJUNTO SIGUIENTE.
         */
        res.forEach(data => siguiente.value[head].push(data))

      }

      /**
       * Se ejecuta el simplificador de varaibles que fueron agregadas al conjunto Siguiente del cada variable.
       */
      simplifyNext()

      isResolved.value = true
    }



    return {
      variable,
      terminal,
      list_Variable,
      produc_rule_Test,
      list_Terminal,
      simVariable,
      cadenasProduccion,
      isCalculating,
      isResolved,
      isResolvedNext,
      primeros,
      dict_produccion_rule,

      getPrimerAnswer: computed(() => (variable, index) => primeros.value[variable][index]
        .toString().replace("[", "")
        .replace(']', "")
        .replace('"', '')
        .replace('"', '')
      ),
      getNextAnswer: computed(() => (variable_tmp) =>
        siguiente.value[variable_tmp].toString().replace(/"/g, "")
      ),
      invert: () => {
        isResolved.value = !isResolved.value
        isResolvedNext.value = !isResolvedNext.value
      },


      addVariable: () => {
        if (variable.value === '') return;
        list_Variable.value.push(variable.value.toUpperCase())
        variable.value = ""
      },
      addTerminal: () => {
        if (terminal.value === '') return;
        list_Terminal.value.push(terminal.value.toLowerCase())
        terminal.value = ""
      },
      addRule: () => {
        if (simVariable.value === "" || cadenasProduccion.value.length === 0) return;

        if (!list_Variable.value.includes(simVariable.value.toUpperCase())) {
          list_Variable.value.push(simVariable.value.toUpperCase())
        }

        let rule = [simVariable.value, cadenasProduccion.value]

        produc_rule_Test.value.push([...rule])

        const cadenas = cadenasProduccion.value.split('|')

        produccion_rules.push([simVariable.value, cadenas])
        vertical_varRule.push(simVariable.value)
        dict_produccion_rule.value[simVariable.value] = cadenas

        rule = []
        simVariable.value = ""
        cadenasProduccion.value = ""

      },

      calculate: () => {
        isResolved.value = false
        isResolvedNext.value = false
        isCalculating.value = true

        let head_rule = '';
        let body_rule = "";
        let indexInclude = -1;

        /**
         * Primer for para iterar la matriz de reglas de produccion
         * En la primer columa se encuentra la Variable de dicha regla -> head_rule
         * En la siguiente columna se encuntra un arreglo con las reglas => body_rule
         */

        for (let i = 0; i < produccion_rules.length; i++) {
          head_rule = produccion_rules[i][0];
          console.log(head_rule);
          body_rule = produccion_rules[i][1];

          primeros.value[head_rule] = [] //Sirve para guardar los calculos de los primeros con su respectica varaible head_rule { head_rule: [result1, result2, ...]}

          /**
           * Este for indice j sirve para recorrer las reglas ( body_rule) que tiene la variable head_rule, para resolver cada una de sus cadenas.
           */
          for (let j = 0; j < body_rule.length; j++) {

            /**
             * isIncluye sirve para saber si en la cadena que se esta evaluando su simbolo de inicio es una variable
             * body_rule[j] es la cedena que se esta evaluando
             * list_Variable.value es el arreglo de varaibles que se tiene
             * retorna -1 si es que la cadena no inicia con ninguna variable
             */
            indexInclude = isInclude(body_rule[j], list_Variable.value);

            /**
             * Si la cadena evaluada no inicia con una variable entonces...
             */
            if (indexInclude === -1) {

              /**
               * Se analiza si la cadena que se está evaluando inicia con un simbolo terminal especial
               * La definicion de "terminal especial" es de mi conocimiento y no aplica para el tema
               * Esto refiere a que el terminal esta conformado por un conjunto de simbolos (ej. id, num, exp1, exp2)
               * para esto la list_Terminal debe contener dichos terminales especiales.
               * body_rule[j] -> Cadena que se está evaluando
               * list_terminales.value -> lista de terminales especiales
               * 
               * retorna un -1 si no se encuetra al inicio uno de los terminales especiales
               * retorna != 1 cuando se encontro el terminal especial que comieza en la posicion 0 de la cadena
               */
              indexInclude = isInclude(body_rule[j], list_Terminal.value);

              /**
               * En caso de enontrase al inicio dicho terminal especial, se aplica la regla numero dos del
               * calculo de conjunto Primero, el cual indica que su conjunto Primero es el terminal.
               * 
               * Por lo tanto Primero(head_rule) = Primero(list_Terminal con el indice del terminal 
               * especial que inicia la cadena evaluada)
               */
              if (indexInclude != -1) {
                // console.log(`Primero(${head_rule}) = {${list_Terminal.value[indexInclude]}}`);
                primeros.value[head_rule].push(list_Terminal.value[indexInclude])
              }

              /**
               * En caso contrario...
               * Se analiza si la cadena que se está evaluando contiene un epsilon (en este caso se utiliza $)
               * En caso que sea positiva la afirmación plateada, se aplica la primer regla del calculo del conjunto
               * primero, que indica que su conjunto Primero es el simbolo vacio epsilon, en este caso ($)
               */
              else if (body_rule[j].trim() === "@") {
                // console.log(`Primero(${head_rule}) = {${body_rule[j]}}`);
                primeros.value[head_rule].push(body_rule[j])
              }
              else {
                /**
                 * Cuando la cadena empieza con un terminal no definido en el conjunto de terminales
                 * 
                 * Entonces se procede a agregar el terminal a la lista de Terminales especiales, para agilizar la validacion
                 * de la cadena, aunque el simbolo no sea en este momento un Terminal especial, ya que en este punto se encuentran
                 * los terminales que estan constituidos por un solo caracter (ej. a, b, <, >, =, etc)
                 * 
                 * Para este caso tambien se aplica la segunda regla del calculo del conjunto primero, que indica que el calculo 
                 * del conjunto Primero sera el simbolo terminal con el que inicia la cadena.
                 */
                // console.log("SE AGREGO A TERMINALE " + body_rule[j][0]);
                list_Terminal.value.push(body_rule[j][0])
                // console.log(`Primero(${head_rule}) = {${body_rule[j][0]}}`);
                primeros.value[head_rule].push(body_rule[j][0])

              }

            } else {
              /**
               * Si la cadena no empiza con un simbolo terminal (simple, especial o epsilon) es 
               * Cuando la cadena si empieza con una Variable - aqui se aplica la tercera regla del calculo
               * del conjunto primero.
               */

              let repeticiones = {}

              /**
               * Se crea un objeto de repeticiones que calcule cuantas veces hubo recursión en una misma head_rule
               * con el fin de que no se convierta en un ciclo infinito.
               * 
               * Todos los contadores de las head_rule comienzan en 0
               */
              vertical_varRule.forEach(regla => repeticiones[regla] = 0)
              repeticiones[head_rule] = 0

              /**
               * Se comienza la recursion 
               * vertical_Rule[i] donde i indica que variable se esta evaluando en esta iteracion principal
               * y debido a que vertical?_Rule mantiene en orden de como ls reglas de produccion se evaluaran, 
               * se obtendra de esta manera la Variable a resolver.
               */

              // let resp_recurs = recursive(vertical_varRule,vertical_varRule[i], dict_produccion_rule.value, list_Terminal.value, repeticiones,  true );
              let resp_recurs = recursive(vertical_varRule, vertical_varRule[indexInclude], dict_produccion_rule.value, list_Terminal.value, repeticiones, true);

              /**
               * Los resultados se agregan a la lista que se encuentra en primeros, como llave se debe utilizar el head_body (variable)
               */
              primeros.value[head_rule].push(resp_recurs)


              // console.log(`Primero(${head_rule}) = {${resp_recurs.toLocaleString()}}`);

            }

          }

        }

        list_Terminal.value = getAllTernminales(list_Variable.value, list_Terminal.value, produc_rule_Test.value)

        // console.log( getAllTernminales( list_Variable.value, list_Terminal.value, produc_rule_Test.value));

        

        next()
      },

      next
      ,

      simplifyNext,

      clean: () => {
        /**
         * Se limpian todas las variables que se utilizaron para el siguiente calculo
         */
        variable.value = ''
        terminal.value = ''
        list_Variable.value = []
        list_Terminal.value = []
        produc_rule_Test.value = []
        simVariable.value = ''
        cadenasProduccion.value = ''
        isCalculating.value = false
        produccion_rules = []
        dict_produccion_rule.value = {}
        vertical_varRule = []
        primeros.value = {}
        isResolved.value = false
        isResolvedNext.value = false
        siguiente.value = {}

      }



    }
  }
}

</script>
<style scoped>
@import "../assets/bootstrap.min.css";

.inputs {
  display: flex;
  flex-direction: row;
}

.inputs div {
  display: flex;
  flex-direction: column;
  margin-left: 20px;
}

.inputs input,
.inputs button {
  width: 300px;
  height: 40px;
  border-radius: 35px;
  margin-top: 5px;
  font-size: 15px;
  text-align: center;
}

P {
  color: #fff;
}

.rules {
  display: flex;
  flex-direction: column;
}

#variable {
  width: 60px;
  height: 40px;
  border-radius: 10px;
}

#cadenas {
  width: 300px;
  height: 40px;
  border-radius: 16px;
  text-align: center;
  font-size: 16px;
}

#add-rule {
  width: 80px;
  height: 40px;
  border-radius: 10px;
  margin: 0;
  padding: 0;
  font-size: 13px;
}

.btn-success {
  height: 40px;
  width: 100px;
  border-radius: 16px;
  background-color: #00BD7E;
  color: #fff;
}
</style>
