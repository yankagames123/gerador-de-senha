document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const lengthSlider = document.getElementById('length');
    const lengthValue = document.getElementById('length-value');
    const quantitySelect = document.getElementById('quantity');
    const uppercaseCheck = document.getElementById('uppercase');
    const lowercaseCheck = document.getElementById('lowercase');
    const numbersCheck = document.getElementById('numbers');
    const symbolsCheck = document.getElementById('symbols');
    const customCharsInput = document.getElementById('custom-chars');
    const generateBtn = document.getElementById('generate');
    const copyAllBtn = document.getElementById('copy-all');
    const exportBtn = document.getElementById('export');
    const passwordsContainer = document.getElementById('passwords-container');
    const entropySpan = document.getElementById('entropy');
    const strengthText = document.getElementById('strength-text');
    const strengthBar = document.getElementById('strength-bar');
    
    // Conjuntos de caracteres
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-={}[]|:;"<>,.?/~';

    // Atualizar valor do slider
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
        updateEntropy();
    });

    // Gerar senha
    generateBtn.addEventListener('click', generatePasswords);

    // Copiar todas as senhas
    copyAllBtn.addEventListener('click', copyAllPasswords);

    // Exportar senhas
    exportBtn.addEventListener('click', exportPasswords);

    // Gerar senha aleatória
    function getRandomChar(charset) {
        const randomArray = new Uint32Array(1);
        window.crypto.getRandomValues(randomArray);
        const randomValue = randomArray[0] / (0xFFFFFFFF + 1);
        return charset.charAt(Math.floor(randomValue * charset.length));
    }

    // Gerar uma senha
    function generatePassword(length) {
        let charset = '';
        
        if (uppercaseCheck.checked) charset += uppercase;
        if (lowercaseCheck.checked) charset += lowercase;
        if (numbersCheck.checked) charset += numbers;
        if (symbolsCheck.checked) charset += symbols;
        
        const customChars = customCharsInput.value;
        if (customChars) charset += customChars;

        // Verificar se pelo menos um conjunto de caracteres está selecionado
        if (!charset) {
            alert('Selecione pelo menos um tipo de caractere!');
            return '';
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            password += getRandomChar(charset);
        }
        
        return password;
    }

    // Gerar múltiplas senhas
    function generatePasswords() {
        passwordsContainer.innerHTML = '';
        const quantity = parseInt(quantitySelect.value);
        const length = parseInt(lengthSlider.value);
        
        for (let i = 0; i < quantity; i++) {
            const password = generatePassword(length);
            if (!password) return;
            
            const passwordElement = document.createElement('div');
            passwordElement.className = 'flex items-center bg-gray-50 rounded-md p-3 fade-in';
            passwordElement.innerHTML = `
                <div class="flex-1">
                    <input type="text" value="${password}" readonly class="password-input w-full px-3 py-2 bg-transparent outline-none text-gray-900">
                </div>
                <div class="flex gap-2">
                    <button class="copy-btn text-indigo-600 hover:text-indigo-800 p-1 rounded focus:outline-none" data-password="${password}">
                        <i class="far fa-copy"></i>
                    </button>
                    <button class="refresh-btn text-gray-600 hover:text-gray-800 p-1 rounded focus:outline-none">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            `;
            
            passwordsContainer.appendChild(passwordElement);
            
            // Adicionar eventos aos botões de cópia e atualização
            const copyBtn = passwordElement.querySelector('.copy-btn');
            const refreshBtn = passwordElement.querySelector('.refresh-btn');
            
            copyBtn.addEventListener('click', function() {
                copyToClipboard(this.dataset.password);
                showCopyFeedback(copyBtn);
            });
            
            refreshBtn.addEventListener('click', function() {
                const newPassword = generatePassword(length);
                passwordElement.querySelector('input').value = newPassword;
                copyBtn.dataset.password = newPassword;
                updateEntropy();
            });
        }
        
        updateEntropy();
    }

    // Copiar senha para área de transferência
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Senha copiada!');
        }).catch(err => {
            console.error('Falha ao copiar:', err);
            // Fallback para navegadores mais antigos
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        });
    }

    // Mostrar feedback visual de cópia
    function showCopyFeedback(button) {
        const icon = button.querySelector('i');
        const originalClass = icon.className;
        
        icon.className = 'fas fa-check';
        setTimeout(() => {
            icon.className = originalClass;
        }, 1500);
    }

    // Copiar todas as senhas
    function copyAllPasswords() {
        const passwordInputs = document.querySelectorAll('.password-input');
        if (passwordInputs.length === 0) {
            alert('Gere senhas primeiro!');
            return;
        }
        
        let allPasswords = '';
        passwordInputs.forEach(input => {
            allPasswords += input.value + '\n';
        });
        
        copyToClipboard(allPasswords.trim());
        
        // Feedback visual
        const originalText = copyAllBtn.innerHTML;
        copyAllBtn.innerHTML = '<i class="fas fa-check"></i> Copiadas!';
        setTimeout(() => {
            copyAllBtn.innerHTML = originalText;
        }, 2000);
    }

    // Exportar senhas
    function exportPasswords() {
        const passwordInputs = document.querySelectorAll('.password-input');
        if (passwordInputs.length === 0) {
            alert('Gere senhas primeiro!');
            return;
        }
        
        let exportText = '=== Senhas Geradas ===\n\n';
        exportText += `Configurações:\n- Tamanho: ${lengthSlider.value} caracteres\n`;
        exportText += `- Maiúsculas: ${uppercaseCheck.checked ? 'Sim' : 'Não'}\n`;
        exportText += `- Minúsculas: ${lowercaseCheck.checked ? 'Sim' : 'Não'}\n`;
        exportText += `- Números: ${numbersCheck.checked ? 'Sim' : 'Não'}\n`;
        exportText += `- Símbolos: ${symbolsCheck.checked ? 'Sim' : 'Não'}\n\n`;
        
        passwordInputs.forEach((input, index) => {
            exportText += `Senha ${index + 1}: ${input.value}\n`;
        });
        
        exportText += `\nEntropia: ${calculateEntropy()} bits`;
        
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'senhas-geradas.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Calcular entropia
    function calculateEntropy() {
        const length = parseInt(lengthSlider.value);
        let charPool = 0;
        
        if (uppercaseCheck.checked) charPool += uppercase.length;
        if (lowercaseCheck.checked) charPool += lowercase.length;
        if (numbersCheck.checked) charPool += numbers.length;
        if (symbolsCheck.checked) charPool += symbols.length;
        
        const customChars = customCharsInput.value;
        if (customChars) charPool += customChars.length;
        
        if (charPool === 0) return 0;
        
        // Entropia = log2(charPool^length)
        return Math.round(length * Math.log2(charPool));
    }

    // Atualizar exibição da entropia e força
    function updateEntropy() {
        const entropy = calculateEntropy();
        entropySpan.innerHTML = `Entropia: <span class="font-bold">${entropy} bits</span>`;
        
        // Atualizar força
        let strength = 'Muito Fraca';
        let strengthColor = 'bg-red-500';
        
        if (entropy > 0 && entropy <= 40) {
            strength = 'Fraca';
            strengthColor = 'bg-orange-500';
        } else if (entropy > 40 && entropy <= 80) {
            strength = 'Média';
            strengthColor = 'bg-yellow-500';
        } else if (entropy > 80 && entropy <= 120) {
            strength = 'Forte';
            strengthColor = 'bg-green-500';
        } else if (entropy > 120) {
            strength = 'Muito Forte';
            strengthColor = 'bg-green-700';
        } else {
            strengthColor = 'bg-gray-300';
        }
        
        strengthText.textContent = strength;
        strengthText.className = 'font-bold ' + (strengthColor === 'bg-green-700' ? 'text-green-700' : 
                                                strengthColor === 'bg-green-500' ? 'text-green-600' : 
                                                strengthColor === 'bg-yellow-500' ? 'text-yellow-600' : 
                                                strengthColor === 'bg-orange-500' ? 'text-orange-600' : 'text-red-600');
        
        // Atualizar barra de força
        let width = 0;
        if (entropy > 0) {
            width = Math.min(100, (entropy / 128) * 100);
        }
        
        strengthBar.className = `h-full ${strengthColor} transition-all duration-500`;
        strengthBar.style.width = `${width}%`;
    }

    // Gerar senhas inicialmente
    generatePasswords();
});