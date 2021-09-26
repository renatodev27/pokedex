let synth = window.speechSynthesis;

const app = new Vue({
    el: '#app',
    data: {
        pokemonList: [],
        pokemon: [],
        searchPokemon: '',
        isLoading: false,
        screenOf: true,
        voices: [],
        choosen_voice: '',

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
        populateVoiceList() {
            this.voices = synth.getVoices();
            console.log(this.voices);

            this.voices.map( (voice) => {
                if (voice.voiceURI === 'Google UK English Female') {
                    this.choosen_voice = voice.name;
                }
            });

            console.log(this.choosen_voice);
        },
        functionWelcomeTalk(text){
            let utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 0.5;

            for (let i = 0; i < this.voices.length; i++) {

                if (this.voices[i].name === this.choosen_voice) utterance.voice = this.voices[i];
            }

            synth.speak(utterance);
        },
        obtenerPokemon(pokemonName) {
            const url = 'https://pokeapi.co/api/v2/pokemon/'+pokemonName;
            this.screenOf = false;
            this.isLoading = true;

            fetch(url).then( (response) => response.json())
            .then( (data) => {
                this.pokemon = data;
                this.functionWelcomeTalk(`
                    A ${this.pokemon.name} has been found;
                `)
                if (this.searchPokemon != '') this.searchPokemon = '';
                this.isLoading = false;
            })
            .catch( (error) => {
                this.pokemon = [];
                this.isLoading = false;
                this.screenOf = true;
                this.functionWelcomeTalk('No pokémon found');
            });
        }
    },
    mounted() {
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = () => this.populateVoiceList();
        }
    }
})

