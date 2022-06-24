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
        prev: null,
        next: null,
        playerPokemon: new Object,
        playerHelath: undefined,
        playerAttack: undefined,
        playerDefense: undefined,
        battleBtn: false,
        captureBtn: false,
        cancelBtn: false,
        myPokemsBtn: true,
        battleIntroduction: true,
        playerPokemonList: [],
        availablePokemons: [],
        screenText: '',
        introduction: true,
        textIntro: '',
        musicBattle: new Audio('./src/pokemon_battle.mp3'),
        synth: window.speechSynthesis
    },
    methods: {
        getPlayerPokemon(pokemonName) {
            if (this.synth.speaking) this.synth.cancel();
            const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
            fetch(url).then( response => response.json() )
            .then( (data) => {
                this.isLoading = true;
                this.playerPokemon = data;

                this.playerPokemon.moves.map( move => {
                    const moveName = move.move.name.replace('-', ' ');
                    const finalMoveName = `${moveName.charAt(0).toUpperCase()}${moveName.substr(1)}`
                    move.move.name = finalMoveName;
                });

                setTimeout(() => {
                    this.getPokemonStats(this.playerPokemon.stats, undefined, false);
                    this.functionWelcomeTalk(`Has escogido a ${this.playerPokemon.name} para la batalla.`)
                    this.screenAction = this.searched ? 'pokemonDetail' : '';
                    this.myPokemsBtn = true;
                    this.cancelBtn = false;
                    if (!this.searched) this.screenOf = true;
                    if (this.searched) this.battleBtn = true;
                    if (this.introduction) this.introduction = false;
                    this.isLoading = false;
                }, 500)
                
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
                    const data_url = `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`;

                    fetch(data_url).then (response => response.json())
                        .then ( (pokedet) => this.pokemonList.push(pokedet))
                })
            })
            .finally( () => this.listLoading = false);
        },
        avaliablePokemons() {
            const availables = ['bulbasaur', 'charmander', 'squirtle', 'pikachu'];

            for (let name of availables) {
                const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
                
                fetch(url).then( response => response.json())
                .then( (pokemon) => this.availablePokemons.push(pokemon))
            }
        },
        populateVoiceList() {
            this.voices = this.synth.getVoices();

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

            this.synth.speak(utterance);
            utterance.addEventListener('end', () => {
                this.speaking = false;
            });
        },
        obtenerPokemon(pokemonName) {
            this.isLoading = true;
            this.returnToTop();
            this.screenAction = 'pokemonDetail';
            this.searchPokemon = pokemonName;
            if (this.synth.speaking) this.synth.cancel();
            
            const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;

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
                    if (this.cancelBtn) this.cancelBtn = false;
                    if (!this.myPokemsBtn) this.myPokemsBtn = true;
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
            if (this.synth.speaking) this.synth.cancel();
            this.isLoading = true;
            this.listLoading = true;
            this.battleBtn = false;
            this.myPokemsBtn = false;
            this.cancelBtn = true;
            this.captureBtn = true;
            if (this.musicBattle === null) this.musicBattle = new Audio('./src/pokemon_battle.mp3'); 
            this.musicBattle.play();

            setTimeout( () => {
                this.isLoading = false;
                this.listLoading = false;
                this.screenAction = 'Battle';
                
                if (this.battleIntroduction) {
                    this.functionWelcomeTalk('Has entrado en una batalla pokemon');
                    this.functionWelcomeTalk(`Para realizar un ataque selecciona una de las opciones de ataque de ${this.playerPokemon.name}`);
                }
                
                this.writeTextEffect(`¿Qué quieres que ${this.playerPokemon.name.toUpperCase()} haga?`)
                
            }, 800);

            const height = document.body.scrollHeight;

            setTimeout( () => {
                if (screen.width < 992 && this.battleIntroduction) window.scrollTo({top: height, behavior: 'smooth'});
                this.battleIntroduction = false;
            }, 5000)
        },
        writeTextEffect(text) {
            if (this.screenText.length) this.screenText = '';
            for (let i = 0; i < text.length; i++) {
                setTimeout( () => this.screenText += text.charAt(i), 50 * i)
            }
        },
        selectEnemyPokemon(data = []) {
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
        getMyPokemons() {
            this.isLoading = true;
            this.screenOf = false;
            this.myPokemsBtn = false;
            this.cancelBtn = true;
            if (this.battleBtn) this.battleBtn = false;

            setTimeout( () => {
                this.screenAction = 'MyPokemons';
                this.isLoading = false;
            }, 500)
        },
        returnToPokemonList() {
            if (this.synth.speaking) this.synth.cancel();
            this.screenOf = true;
            this.searched = false;
            this.pokemon = [];
            this.cancelar();
            this.battleBtn = false;
        },
        cancelar() {
            if (this.synth.speaking) this.synth.cancel();
            this.screenAction = this.searched ? 'pokemonDetail' : undefined;
            this.battleBtn = this.searched ? true : false;
            if (!this.searched) this.screenOf = true;
            this.cancelBtn = false;
            this.myPokemsBtn = true;
            this.captureBtn = false;

            this.musicBattle.pause();
            this.musicBattle.currentTime = 0;
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
        pokedexIntroduction() {
            const height = document.body.scrollHeight;
            
            if (this.introduction) {
                this.isLoading = true;
                this.screenOf = false;
                const txt = 'Hola entrenador! Soy tu pokedex N° 782. Antes de empezar, por favor elige tu pokemón para batallar.';
                const talkText = 'Hola entrenador! Soy tu pokedex número 782. Antes de empezar, por favor elige tu pokemón para batallar.';
    
                setTimeout( () => {
                    this.functionWelcomeTalk(talkText);
                    this.screenAction = 'MyPokemons';
                    this.myPokemsBtn = false;
                    this.isLoading = false;
                    if (screen.width < 992) window.scrollTo({top: height, behavior: 'smooth'});

                    for (let i in txt) {
                        setTimeout(() => this.textIntro += txt.charAt(i), 90 * i)
                    }
                }, 500)
            }
        },
        maximize() {
            let elem = document.documentElement;
            if (elem.requestFullscreen) elem.requestFullscreen();
            else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
            else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
        }
    },
    updated() {
        if (window.undefined) musicBattle.pause();
    },
    created() {
        this.listarPokemones();
        this.avaliablePokemons();
        this.pokedexIntroduction();
    },
    beforeMount() {
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.populateVoiceList();
        }
    },
    mounted() {
    }
})

