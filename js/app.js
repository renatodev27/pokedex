let synth = window.speechSynthesis;
const musicBattle = new Audio('./src/pokemon_battle.mp3');

const app = new Vue({
    el: '#app',
    data: {
        pokemonList: [],
        pokemon: [],
        searchPokemon: '',
        speaking: false,
        isLoading: false,
        listLoading: true,
        screenAction: undefined,
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
        pokemonTypes: new Array,
        prev: null,
        next: null,
        playerPokemon: new Object,
        playerHelath: undefined,
        playerAttack: undefined,
        playerDefense: undefined,
        battleBtn: false,
        captureBtn: false,
        battleIntroduction: true,
        myPokemons: new Array
    },
    methods: {
        getPlayerPokemon() {
            const url = 'https://pokeapi.co/api/v2/pokemon/pikachu';
            fetch(url).then( response => response.json() )
            .then( (data) => {
                this.playerPokemon = data;

                this.playerPokemon.moves.map( move => {
                    const moveName = move.move.name.replace('-', ' ');
                    const finalMoveName = `${moveName.charAt(0).toUpperCase()}${moveName.substr(1)}`
                    move.move.name = finalMoveName;
                });

                this.getPokemonStats(this.playerPokemon.stats, undefined, false);
                //console.log(this.playerPokemon);
            })
            .catch( error => console.log(error));
        },
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

                    if (pokemon.name === 'charmander') this.myPokemons.push(pokemon);

                    fetch(data_url).then (response => response.json()).then ( (pokedet) => {
                        this.pokemonList.push(pokedet);
                        this.listLoading = false;
                    })
                })
            })
        },
        populateVoiceList() {
            this.voices = synth.getVoices();

            this.voices.map( (voice) => {
                if (voice.voiceURI === 'Google Español') {
                    this.choosen_voice = voice.name;
                }
            });
        },
        functionWelcomeTalk(text) {
            this.speaking = true;
            let utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 0.5;

            for (let i = 0; i < this.voices.length; i++) {
                if (this.voices[i].name === this.choosen_voice) utterance.voice = this.voices[i];
            }

            synth.speak(utterance);
            utterance.addEventListener('end', () => {
                this.speaking = false;
            });
        },
        obtenerPokemon(pokemonName) {
            const url = 'https://pokeapi.co/api/v2/pokemon/'+pokemonName.toLowerCase();
            this.returnToTop();
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
                    this.battleBtn = true;
                    this.isLoading = false;
                })
                .catch( (error) => {
                    this.pokemon = [];
                    this.isLoading = false;
                    this.screenOf = true;
                    this.searched = false;
                    this.functionWelcomeTalk('No pokémon found');
                    console.log(error);
                });
            }
            else {
                if (this.screenOf) this.screenOf = true;
                this.isLoading = false;
            }
        },
        pokemonBattle() {
            window.scrollTo({top: 0, behavior: 'smooth'});
            if (synth.speaking) synth.cancel();
            this.isLoading = true;
            this.listLoading = true;
            this.battleBtn = false;
            this.captureBtn = true;
            musicBattle.play();

            setTimeout( () => {
                this.isLoading = false;
                this.listLoading = false;
                this.screenAction = 'Battle';

                if (this.battleIntroduction) {
                    this.functionWelcomeTalk('Has entrado en una batalla pokemon');
                    this.functionWelcomeTalk('Para realizar un ataque selecciona una de las opciones de ataque de tu pokemon');
                }
            }, 800);

            const height = document.body.scrollHeight;

            setTimeout( () => {
                if (screen.width < 992 && this.battleIntroduction) window.scrollTo({top: height, behavior: 'smooth'});
                this.battleIntroduction = false;
            }, 5000)
        },
        choosePokemon(data = []) {
            this.returnToTop();
            this.searchPokemon = data['name'];
            this.obtenerPokemon(data['name']);
        },
        getPokemonStats(listStats, pokeName, speak = true) {
            let hpText, attackText, defenseText, sp_attack, sp_defense, speed;

            listStats.map( (stat) => {

                switch (stat.stat.name) {
                    case 'hp' : 
                        hpText = `Tiene ${stat.base_stat} de salud.`;
                        this.pokeHp =  'Health';
                        speak ? this.statHp = stat.base_stat : this.playerHelath = stat.base_stat;
                    break;
                    case 'attack' : 
                        attackText = `${stat.base_stat} de ataque.`; 
                        this.pokeAttack = `${stat.stat.name.charAt(0).toUpperCase()}${stat.stat.name.substr(1)}`;
                        speak ? this.statAttack = stat.base_stat : this.playerAttack = stat.base_stat;
                    break;
                    case 'defense' : 
                        defenseText = `${stat.base_stat} de defensa.`; 
                        this.pokeDefense = `${stat.stat.name.charAt(0).toUpperCase()}${stat.stat.name.substr(1)}`;
                        speak ? this.statDefense = stat.base_stat : this.playerDefense = stat.base_stat;
                    break;
                    case 'special-attack' :
                        sp_attack = `Tiene ${stat.base_stat} de ataque especial.`; 
                        this.pokeSpAttack = `${stat.stat.name.charAt(0).toUpperCase()}${stat.stat.name.substr(1)}`;
                        this.statSpat = stat.base_stat;
                    break;
                    case 'special-defense' : 
                        sp_defense = `Tiene ${stat.base_stat} de defensa especial.`; 
                        this.pokeSpDefense = `${stat.stat.name.charAt(0).toUpperCase()}${stat.stat.name.substr(1)}`;
                        this.statSpdef = stat.base_stat;
                    break;
                    case 'speed' : 
                        speed = `Tiene ${stat.base_stat} de velocidad.`; 
                        this.pokeSpeed = `${stat.stat.name.charAt(0).toUpperCase()}${stat.stat.name.substr(1)}`;
                        this.statSpeed = stat.base_stat;
                    break;
                }
            })

            if (speak) this.functionWelcomeTalk(` Has encontrado un ${pokeName}. ${hpText} ${attackText} y ${defenseText}. 
            ¿Quieres capturarlo?`);
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
            this.cancelar();
            this.battleBtn = false;
        },
        cancelar() {
            this.screenAction = undefined;
            this.battleBtn = true;
            this.captureBtn = false;
            musicBattle.pause();
            musicBattle.currentTime = 0;
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
        },
        returnToTop() {
            if (screen.width < 992) window.scrollTo({top: 0, behavior: 'smooth'});
        },
        onWelcome() {
            this.functionWelcomeTalk("Hi trainer. I'm pokédex N 782. To begin; please select a pokemon from the list");
        },
        maximize() {
            let elem = document.documentElement;
            if (elem.requestFullscreen) elem.requestFullscreen();
            else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
            else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
        }
    },
    created() {
        this.getPokemonsTypes();
        this.listarPokemones();
        this.getPlayerPokemon();
    },
    beforeMount() {
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = () => this.populateVoiceList();
        }
    },
    mounted() {
        //this.onWelcome();
    }
})

