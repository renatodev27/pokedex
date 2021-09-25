const app = new Vue({
    el: '#app',
    data: {
        pokemonList: [],
        pokemon: [],
        searchPokemon: 'pikachu',
    },
    methods: {
        listarPokemones() {
            const url = 'https://pokeapi.co/api/v2/pokemon';

            fetch(url).then ( (response) => response.json())
            .then( (pokemons) => {
                
                pokemons.results.map( (pokemon) => {
                    const data_url = 'https://pokeapi.co/api/v2/pokemon/'+pokemon.name;

                    fetch(data_url).then (response => response.json()).then ( (pokedet) => {
                        //console.log(pokedet);
                        this.pokemonList.push(pokedet);
                    })
                })
            });
        },
        obtenerPokemon(pokemonName) {
            const url = 'https://pokeapi.co/api/v2/pokemon/'+pokemonName;

            fetch(url).then( (response) => response.json())
            .then( (data) => {
                this.pokemon = data;
                if (this.searchPokemon != '') this.searchPokemon = '';
                //console.log(this.pokemon);
            })
            .catch( (error) => {
                console.log(error);
            });
        }
    },
    mounted() {
        this.obtenerPokemon(this.searchPokemon);
    }
})