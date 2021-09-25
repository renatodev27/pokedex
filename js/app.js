const app = new Vue({
    el: '#app',
    data: {
        pokemonList: [],
    },
    methods: {
        listarPokemones() {
            const url = 'https://pokeapi.co/api/v2/pokemon';

            fetch(url).then ( (response) => response.json())
            .then( (pokemons) => {
                
                pokemons.results.map( (pokemon) => {
                    const data_url = 'https://pokeapi.co/api/v2/pokemon/'+pokemon.name;

                    fetch(data_url).then (response => response.json()).then ( (pokedet) => {
                        console.log(pokedet);
                        this.pokemonList.push(pokedet);
                    })
                })
            });
        }
    },
    mounted() {
        this.listarPokemones();
    }
})