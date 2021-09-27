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
        pokemonTypes: [],
        prev: null,
        next: null,
    },
    methods: {
        listarPokemones(url) {
            if (!this.next) url = 'https://pokeapi.co/api/v2/pokemon';
            if (!this.listLoading) this.listLoading = true;
            if (this.pokemonList.length) this.pokemonList = [];

            fetch(url).then ( (response) => response.json())
            .then( (pokemons) => {
                this.prev = pokemons.previous;
                this.next = pokemons.next;
                
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
            const url = 'https://pokeapi.co/api/v2/pokemon/'+pokemonName.toLowerCase();
            this.isLoading = true;
            if (synth.speaking) synth.cancel();

            if (this.searchPokemon !== '') {
                fetch(url).then( (response) => response.json(), this.screenOf = false)
                .then( (data) => {
                    this.pokemon = data;

                    this.pokemon.types.map( type => { 
                        type['type'] = {
                            name: type['type'].name,
                            url: type['type'].url,
                            color: this.defineColorsByType(type['type'].name)
                        }
                    })

                    this.getPokemonStats(this.pokemon.stats, this.pokemon.name);
                    if (this.searchPokemon != '') this.searchPokemon = '';
                    this.searched = true;
                    this.isLoading = false;
                    
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
            this.searchPokemon = data['name'];
            this.obtenerPokemon(data['name']);
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
                this.pokemonTypes = data.results;
            })
        },
        returnToPokemonList() {
            if (synth.speaking) synth.cancel();
            this.screenOf = true;
            this.searched = false;
            this.pokemon = [];
        },
        nextPrevPokemonList(action) {
            switch (action) {
                case 'next' : this.listarPokemones(this.next); break;
                case 'prev' : this.listarPokemones(this.prev); break;
            }
        },
        defineColorsByType(name) {
            let color;

            switch (name) {
                case 'normal' : color = '#7B7B7B'; break;
                case 'fighting' : color = '#585AF7'; break;
                case 'flying' : color = '#12C7A9'; break;
                case 'poison' : color = '#C90C55'; break;
                case 'ground' : color = '#97682F'; break;
                case 'rock' : color = '#89755D'; break;
                case 'bug' : color = '#A24C1B'; break;
                case 'ghost' : color = '#2E102A'; break;
                case 'steel' : color = '#686A6D'; break;
                case 'fire' : color = '#FF3600'; break;
                case 'water' : color = '#19B2F5'; break;
                case 'grass' : color = '#13FD00'; break;
                case 'electric' : color = '#F5B919'; break;
                case 'psychic' : color = '#19F5A8'; break;
                case 'ice' : color = '#62C7CD'; break;
                case 'dragon' : color = '#FF2121'; break;
                case 'dark' : color = '#383838'; break;
                case 'fairy' : color = '#F94FA6'; break;
                case 'unknown' : color = '#AC865B'; break;
                case 'shadow' : color = '#9EB2AF'; break;
            }

            return color;
        }
    },
    created() {
        this.getPokemonsTypes();
        this.listarPokemones();
    },
    mounted() {
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = () => this.populateVoiceList();
        }
    }
})

