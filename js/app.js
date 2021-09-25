const app = new Vue({
    el: '#app',
    data: {
        title: 'Pokedex',
        pokemonList: [],
    },
    methods: {
        listarPokemones() {
            const url = 'https://pokeapi.co/api/v2/pokemon';

            fetch(url).then ( (response) => response.json())
            .then( (data) => {
                this.pokemonList = data.results;
                console.log(this.pokemonList);
            });
        }
    },
    mounted() {
        this.listarPokemones();
    }
})