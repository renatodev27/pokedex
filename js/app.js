const app = new Vue({
    el: '#app',
    data: {
        pokemonList: [],
        pokemon: [],
        searchPokemon: '',
        isLoading: false,
        screenOf: true,
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
            this.screenOf = false;
            this.isLoading = true;

            fetch(url).then( (response) => response.json())
            .then( (data) => {
                this.pokemon = data;
                if (this.searchPokemon != '') this.searchPokemon = '';
                this.isLoading = false;
            })
            .catch( (error) => {
                this.pokemon = [];
                this.isLoading = false;
                this.screenOf = true;
            });
        }
    },
    mounted() {
        //this.obtenerPokemon(this.searchPokemon);
    }
})