var i, keyCode = {}, supportedKeys;
supportedKeys = tizen.tvinputdevice.getSupportedKeys();
console.log(supportedKeys);
for (i = 0; i < supportedKeys.length; i++) {
    keyCode[supportedKeys[i].name] = supportedKeys[i].code;
}
if(keyCode.hasOwnProperty("KEY_LEFT")) {
    tizen.tvinputdevice.registerKey("KEY_LEFT");
}
if(keyCode.hasOwnProperty("KEY_RIGHT")) {
    tizen.tvinputdevice.registerKey("KEY_RIGHT");}
if(keyCode.hasOwnProperty("KEY_DOWN")) {
    tizen.tvinputdevice.registerKey("KEY_DOWN");}
if(keyCode.hasOwnProperty("KEY_UP")) {
    tizen.tvinputdevice.registerKey("KEY_UP");}
if(keyCode.hasOwnProperty("KEY_ENTER")) {
    tizen.tvinputdevice.registerKey("KEY_ENTER");}
if(keyCode.hasOwnProperty("KEY_BACK")) {
    tizen.tvinputdevice.registerKey("KEY_BACK");}

window.addEventListener("keydown", function(keyEvent) {
    // identify the key by the numeric code from the keyEvent
    if(keyEvent.keyCode === keyCode.KEY_LEFT) {
        console.log("The LEFT key was pressed");
    }
    if(keyEvent.keyCode === keyCode.KEY_RIGHT) {
        console.log("The RIGHT key was pressed");
    }
    if(keyEvent.keyCode === keyCode.KEY_DOWN) {
        console.log("The DOWN key was pressed");
    }
    if(keyEvent.keyCode === keyCode.KEY_UP) {
        console.log("The UP key was pressed");
    }
    if(keyEvent.keyCode === keyCode.KEY_ENTER) {
        console.log("The ENTER key was pressed");
    }
    if(keyEvent.keyCode === keyCode.KEY_BACK) {
        console.log("The BACK key was pressed");
    }
});

var baseFolderUrl = 'https://venturas23.github.io/VenturaStudio/js/Lista/M3U/FILMES/';

// Função para listar os nomes dos arquivos de categorias
async function fetchM3UFiles() {
    try {
        const response = await fetch(baseFolderUrl + 'file-list.json');
        if (!response.ok) throw new Error(`Erro ao obter lista de arquivos: ${response.statusText}`);
        const fileNames = await response.json();
        return fileNames.map(fileName => ({
            url: baseFolderUrl + fileName,
            nome: fileName.replace('.m3u', '')
        }));
    } catch (error) {
        console.error("Erro ao buscar arquivos M3U:", error);
        return [];
    }
}

// Função para carregar filmes de uma categoria
async function carregarFilmes(arquivoUrl) {
    try {
        const response = await fetch(arquivoUrl);
        if (!response.ok) throw new Error(`Erro ao carregar arquivo M3U: ${response.statusText}`);
        const m3uText = await response.text();
        const linhas = m3uText.split("\n");
        const filmes = [];
        
        let nomeCanal = '', capa = '', link = '';

        for (const linha of linhas) {
            if (linha.startsWith("#EXTINF")) {
                nomeCanal = linha.split(",")[1]?.trim() || 'Sem Nome';
                const logoMatch = linha.match(/tvg-logo="([^"]+)"/);
                capa = logoMatch ? logoMatch[1] : '';
            } else if (linha && !linha.startsWith("#")) {
                link = linha.trim();
                filmes.push({ nomeCanal, capa, link });
            }
        }
        return filmes;
    } catch (error) {
        console.error("Erro ao carregar filmes:", error);
        return [];
    }
}

// Função para criar uma categoria vazia
function criarCategoria(categoriaNome, categoriaIndex) {
    const categoriasContainer = document.getElementById('categoriasContainer');

    const categoriaDiv = document.createElement('div');
    categoriaDiv.classList.add('categoria');
    categoriaDiv.setAttribute('tabindex', 0);
    categoriaDiv.setAttribute('aria-label', `Categoria ${categoriaNome}`);
    categoriaDiv.dataset.index = categoriaIndex;

    const titulo = document.createElement('h2');
    titulo.classList.add('titulo-categoria');
    titulo.textContent = categoriaNome;

    const carrossel = document.createElement('div');
    carrossel.classList.add('carrossel');
    carrossel.dataset.categoria = categoriaIndex;

    categoriaDiv.appendChild(titulo);
    categoriaDiv.appendChild(carrossel);
    categoriasContainer.appendChild(categoriaDiv);
}

// Função para carregar os itens de uma categoria
async function carregarCategoria(categoriaDiv, arquivoUrl) {
    const carrossel = categoriaDiv.querySelector('.carrossel');
    carrossel.innerHTML = ''; // Limpa antes de carregar

    const filmes = await carregarFilmes(arquivoUrl);
    filmes.forEach((filme, index) => {
        const filmeItem = document.createElement('div');
        filmeItem.classList.add('item-filme');
        filmeItem.setAttribute('tabindex', 0);
        filmeItem.setAttribute('role', 'button');
        filmeItem.setAttribute('aria-label', `Filme: ${filme.nomeCanal}`);
        filmeItem.dataset.index = index;
        filmeItem.dataset.capa = filme.capa || 'placeholder.jpg'; // Define o dataset para Lazy Loading
        filmeItem.dataset.nomeCanal = filme.nomeCanal;
        filmeItem.dataset.link = filme.link;

        // Adiciona eventos
        filmeItem.onclick = () => abrirIframeFilme(filme.link);
        filmeItem.onkeydown = (e) => {
        	window.addEventListener("keydown", function(keyEvent) {
        		if (keyEvent.keyCode === keyCode.KEY_ENTER) {
        			abrirFilmeNoPlayerNativo(filme.link);
        		} else if (keyEvent.keyCode === keyCode.KEY_RIGHT) {
        			navegarCarrossel(carrossel, filmeItem, 1); // Próximo item
        		} else if (keyEvent.keyCode === keyCode.KEY_LEFT) {
        			navegarCarrossel(carrossel, filmeItem, -1); // Item anterior
        		}
        		});
        };

        carrossel.appendChild(filmeItem);
    });

    iniciarLazyLoadingImagens(carrossel); // Ativa o Lazy Loading para as imagens do carrossel
}

// Lazy Loading para imagens com remoção ao sair do foco
function iniciarLazyLoadingImagens(carrossel) {
    const itensFilme = carrossel.querySelectorAll('.item-filme');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                const item = entry.target;

                if (entry.isIntersecting) {
                    // Se o item está visível, carrega a imagem
                    if (!item.querySelector('img')) {
                        const img = document.createElement('img');
                        img.src = item.dataset.capa;
                        img.alt = item.dataset.nomeCanal;
                        img.loading = "lazy"; // Melhora o carregamento de imagens
                        item.appendChild(img);
                    }
                } else {
                    // Remove a imagem se o item sair do viewport
                    const img = item.querySelector('img');
                    if (img) {
                        img.remove(); // Remove a imagem do DOM
                    }
                }
            });
        },
        {
            root: null, // Usa o viewport como referência
            threshold: 0.1 // Quando 10% do item está visível
        }
    );

    itensFilme.forEach(item => observer.observe(item));
}

// Inicializa as categorias com carregamento dinâmico
async function listarCategorias() {
    const arquivosM3U = await fetchM3UFiles();

    // Cria categorias vazias
    arquivosM3U.forEach((arquivo, index) => {
        criarCategoria(arquivo.nome, index + 1);
    });

    iniciarLazyLoadingCategorias(arquivosM3U);
    iniciarNavegacaoEntreCategorias();

    // Focar na primeira categoria ao carregar
    const primeiraCategoria = document.querySelector('.categoria');
    if (primeiraCategoria) {
        primeiraCategoria.focus();
    }
}


// Lazy loading de categorias
function iniciarLazyLoadingCategorias(arquivosM3U) {
    const categorias = document.querySelectorAll('.categoria');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(async (entry) => {
                const categoriaDiv = entry.target;
                const categoriaIndex = categoriaDiv.dataset.index;

                if (entry.isIntersecting) {
                    // Carrega a categoria visível
                    const arquivoUrl = arquivosM3U[categoriaIndex - 1].url;
                    await carregarCategoria(categoriaDiv, arquivoUrl);
                } else {
                    // Remove itens da categoria fora de visão
                    const carrossel = categoriaDiv.querySelector('.carrossel');
                    carrossel.innerHTML = '';
                }
            });
        },
        {
            root: null, // Viewport
            threshold: 0.1 // Quando 10% do elemento estiver visível
        }
    );

    categorias.forEach(categoria => observer.observe(categoria));
}

// Navegação no carrossel com setas do teclado
function navegarCarrossel(carrossel, itemAtual, direcao) {
    const itens = Array.from(carrossel.querySelectorAll('.item-filme'));
    const indexAtual = itens.indexOf(itemAtual);
    const novoIndex = indexAtual + direcao;

    if (novoIndex >= 0 && novoIndex < itens.length) {
        const novoItem = itens[novoIndex];
        novoItem.focus(); // Move o foco para o próximo ou anterior
        novoItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
        });
    }
}


// Navegação entre categorias com Enter e setas
function iniciarNavegacaoEntreCategorias() {
    const categorias = Array.from(document.querySelectorAll('.categoria'));

    categorias.forEach(categoria => {
        categoria.onkeydown = (e) => {
        	window.addEventListener("keydown", function(keyEvent) {
        		if (keyEvent.keyCode === keyCode.KEY_ENTER) {
        			const carrossel = categoria.querySelector('.carrossel');
        			const primeiroItem = carrossel.querySelector('.item-filme');
        			if (primeiroItem) {
        				primeiroItem.focus();
        			}
        		} else if (keyEvent.keyCode === keyCode.KEY_DOWN) {
        			const proximaCategoria = categorias[categorias.indexOf(categoria) + 1];
        			if (proximaCategoria) {
        				proximaCategoria.focus();
        				proximaCategoria.scrollIntoView({
        					behavior: 'smooth',
        					block: 'start',
        					inline: 'nearest',
        				});
        			}
        		} else if (keyEvent.keyCode === keyCode.KEY_UP) {
        			const categoriaAnterior = categorias[categorias.indexOf(categoria) - 1];
        			if (categoriaAnterior) {
        				categoriaAnterior.focus();
        				categoriaAnterior.scrollIntoView({
        					behavior: 'smooth',
        					block: 'start',
        					inline: 'nearest',
        				});
        			}
        			}
            });
        };
    });
}


function abrirFilmeNoPlayerNativo(url) {
    if (typeof tizen === 'undefined' || !tizen.tvavplay) {
        console.error('AVPlay não está disponível neste dispositivo.');
        alert('Reprodução não é suportada no ambiente atual.');
        return;
    }

    try {
        // Obtém o objeto AVPlay
        const avplay = tizen.tvavplay;

        // Exibe o contêiner do player
        const avplayContainer = document.getElementById('avplayContainer');
        avplayContainer.style.display = 'block';

        // Inicializa o player com o URL do vídeo
        avplay.open(url);

        // Configura o display de vídeo para ocupar todo o contêiner
        avplay.setDisplayRect(0, 0, window.innerWidth, window.innerHeight);

        // Configura opções adicionais
        avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN'); // Tela cheia

        // Prepara e inicia a reprodução
        avplay.prepareAsync(() => {
            avplay.play();
        }, (error) => {
            console.error('Erro ao preparar o player:', error);
        });

        // Eventos do player
        avplay.setListener({
            oncurrentplaytime: (time) => console.log('Tempo atual:', time),
            onstreamcompleted: () => {
                console.log('Reprodução concluída.');
                fecharPlayerNativo(avplay);
            },
            onerror: (error) => {
                console.error('Erro durante a reprodução:', error);
                fecharPlayerNativo(avplay);
            },
        });

        // Controle remoto para sair do player
        window.addEventListener("keydown", function(keyEvent) {
            if (keyEvent.keyCode === keyCode.KEY_BACK) {
                fecharPlayerNativo(avplay);
            }
        });

    } catch (error) {
        console.error('Erro ao inicializar o AVPlay:', error);
        alert('Não foi possível reproduzir o vídeo.');
    }
}

function fecharPlayerNativo(avplay) {
    // Para e fecha o player
    avplay.stop();
    avplay.close();

    // Esconde o contêiner do player
    const avplayContainer = document.getElementById('avplayContainer');
    avplayContainer.style.display = 'none';
    console.log('Player fechado.');
}



// Inicializa o sistema
listarCategorias();