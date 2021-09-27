let synth = window.speechSynthesis;

const app = new Vue({
    el: '#app',
    data: {
        pokemonList: [],
        pokemon: [],
        searchPokemon: '',
        isLoading: false,
        listLoading: true,
        screenOf: true,
        voices: [],
        choosen_voice: '',
        searched: false,
        pokeHp: '',
        statHp: 0,
        pokeAttack: '',
        statAttack: 0,
        pokeDefense: '',
        statDefense: 0,
        pokeSpAttack: '',
        statSpat: 0, 
        pokeSpDefense: '',
        statSpdef: 0,
        pokeSpeed: '',
        statSpeed: 0,
        pokeType: '',
    },
    methods: {
        listarPokemones() {
            const url = 'https://pokeapi.co/api/v2/pokemon';
            if (!this.listLoading) this.listLoading = true;

            fetch(url).then ( (response) => response.json())
            .then( (pokemons) => {
                
                pokemons.results.map( (pokemon) => {
                    const data_url = 'https://pokeapi.co/api/v2/pokemon/'+pokemon.name;

                    fetch(data_url).then (response => response.json()).then ( (pokedet) => {
                        this.pokemonList.push(pokedet);
                        this.listLoading = false;
                    })
                })
            });
        },
        populateVoiceList() {
            this.voices = synth.getVoices();

            this.voices.map( (voice) => {
                if (voice.voiceURI === 'Google UK English Female') {
                    this.choosen_voice = voice.name;
                }
            });
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
            this.isLoading = true;
            this.searched = true;
            if (synth.speaking) synth.cancel();

            if (this.searchPokemon !== '') {
                fetch(url).then( (response) => response.json(), this.screenOf = false)
                .then( (data) => {
                    this.pokemon = data;
                    this.getPokemonStats(this.pokemon.stats, this.pokemon.name);
                    if (this.searchPokemon != '') this.searchPokemon = '';
                    this.isLoading = false;
                    console.log(data);
                })
                .catch( (error) => {
                    if (error) {
                        this.pokemon = [];
                        this.isLoading = false;
                        this.screenOf = true;
                        this.searched = false;
                        this.functionWelcomeTalk('No pokémon found');
                    }
                });
            }
            else {
                if (this.screenOf) this.screenOf = true;
                this.isLoading = false;
            }
        },
        choosePokemon(data = []) {
            this.searched = true;
            this.getPokemonStats(data['stats'], data['name']);
            this.screenOf = false;
            this.pokemon = data;
            console.log(data);
        },
        getPokemonStats(listStats, pokeName) {
            let hp, attack, defense, sp_attack, sp_defense, speed;

            listStats.map( (stat) => {

                switch (stat.stat.name) {
                    case 'hp' : 
                        hp = 'Have a' + stat.base_stat + ' of health.';
                        this.pokeHp =  'Health';
                        this.statHp = stat.base_stat;
                    break;
                    case 'attack' : 
                        attack = 'Have a' + stat.base_stat + ' of attack.'; 
                        this.pokeAttack = `${stat.stat.name.charAt(0).toUpperCase()}${stat.stat.name.substr(1)}`;
                        this.statAttack = stat.base_stat;
                    break;
                    case 'defense' : 
                        defense = 'Have a' + stat.base_stat + ' of defense.'; 
                        this.pokeDefense = `${stat.stat.name.charAt(0).toUpperCase()}${stat.stat.name.substr(1)}`;
                        this.statDefense = stat.base_stat;
                    break;
                    case 'special-attack' :
                        sp_attack = 'Have a' + stat.base_stat + ' of special attack.'; 
                        this.pokeSpAttack = `${stat.stat.name.charAt(0).toUpperCase()}${stat.stat.name.substr(1)}`;
                        this.statSpat = stat.base_stat;
                    break;
                    case 'special-defense' : 
                        sp_defense = 'Have a' + stat.base_stat + ' of special defense.'; 
                        this.pokeSpDefense = `${stat.stat.name.charAt(0).toUpperCase()}${stat.stat.name.substr(1)}`;
                        this.statSpdef = stat.base_stat;
                    break;
                    case 'speed' : 
                        speed = 'Have a' + stat.base_stat + ' of speed.'; 
                        this.pokeSpeed = `${stat.stat.name.charAt(0).toUpperCase()}${stat.stat.name.substr(1)}`;
                        this.statSpeed = stat.base_stat;
                    break;
                }
            })

            this.functionWelcomeTalk(` A ${pokeName} has been found. ${hp} ${attack} and ${defense} `)
        },
        getPokemonsTypes() {
            const url = 'https://pokeapi.co/api/v2/type';

            fetch(url).then ( (response) => response.json())
            .then ( (data) => {
                data.results.map( (type) => {
                    type
                })
            })
        },
        returnToPokemonList() {
            if (synth.speaking) synth.cancel();
            this.screenOf = true;
            this.searched = false;
            this.pokemon = [];
        }
    },
    created() {
        this.listarPokemones();
    },
    mounted() {
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = () => this.populateVoiceList();
        }
    }
})

