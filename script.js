// Hesap makinesi JavaScript kodu
let display = document.getElementById('display');
let currentInput = '0';
let shouldResetDisplay = false;

// Ekranı güncelle
function updateDisplay() {
    display.value = currentInput;
}

// Ekrana değer ekle
function appendToDisplay(value) {
    if (shouldResetDisplay) {
        currentInput = '';
        shouldResetDisplay = false;
    }
    
    // İlk karakter sıfır ise ve yeni karakter nokta değilse, sıfırı değiştir
    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else if (currentInput === '0' && value === '.') {
        currentInput += value;
    } else {
        // Ardışık operatörleri önle
        if (isOperator(value) && isOperator(currentInput.slice(-1))) {
            currentInput = currentInput.slice(0, -1) + value;
        } else {
            currentInput += value;
        }
    }
    
    updateDisplay();
}

// Karakterin operatör olup olmadığını kontrol et
function isOperator(char) {
    return ['+', '-', '*', '/'].includes(char);
}

// Ekranı temizle
function clearDisplay() {
    currentInput = '0';
    updateDisplay();
    
    // Hata stilini kaldır
    display.classList.remove('error');
}

// Son karakteri sil
function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Hesaplama yap
function calculate() {
    try {
        // Güvenlik için eval yerine daha güvenli bir yöntem kullan
        let expression = currentInput;
        
        // Çarpma işareti değiştir
        expression = expression.replace(/×/g, '*');
        
        // Boş veya geçersiz ifade kontrolü
        if (!expression || expression.trim() === '') {
            throw new Error('Boş ifade');
        }
        
        // Son karakter operatör ise kaldır
        if (isOperator(expression.slice(-1))) {
            expression = expression.slice(0, -1);
        }
        
        // Güvenli hesaplama
        let result = evaluateExpression(expression);
        
        // Sonuç kontrolü
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Geçersiz sonuç');
        }
        
        // Sonucu formatla
        currentInput = formatResult(result);
        shouldResetDisplay = true;
        updateDisplay();
        
    } catch (error) {
        currentInput = 'Hata';
        updateDisplay();
        
        // Hata stilini ekle
        display.classList.add('error');
        
        // 2 saniye sonra temizle
        setTimeout(() => {
            clearDisplay();
        }, 2000);
    }
}

// Güvenli matematiksel ifade değerlendirme
function evaluateExpression(expr) {
    // Sadece sayılar, operatörler ve nokta içermeli
    if (!/^[0-9+\-*/.() ]+$/.test(expr)) {
        throw new Error('Geçersiz karakter');
    }
    
    // Function constructor kullanarak güvenli hesaplama
    return Function('"use strict"; return (' + expr + ')')();
}

// Sonucu formatla
function formatResult(result) {
    // Çok büyük veya çok küçük sayıları bilimsel notasyonda göster
    if (Math.abs(result) > 1e10 || (Math.abs(result) < 1e-6 && result !== 0)) {
        return result.toExponential(6);
    }
    
    // Ondalık kısmı varsa en fazla 10 basamak göster
    if (result % 1 !== 0) {
        return parseFloat(result.toFixed(10)).toString();
    }
    
    return result.toString();
}

// Klavye desteği
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Sayılar ve nokta
    if (/[0-9.]/.test(key)) {
        appendToDisplay(key);
    }
    // Operatörler
    else if (['+', '-', '*', '/'].includes(key)) {
        appendToDisplay(key);
    }
    // Enter veya = ile hesaplama
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }
    // Escape veya C ile temizleme
    else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    }
    // Backspace ile silme
    else if (key === 'Backspace') {
        event.preventDefault();
        deleteLast();
    }
});

// Sayfa yüklendiğinde ekranı başlat
window.addEventListener('load', function() {
    updateDisplay();
    
    // Animasyon için kısa bir gecikme
    setTimeout(() => {
        document.querySelector('.calculator').style.opacity = '1';
    }, 100);
});

// Hata durumunda animasyon bitince stil kaldır
display.addEventListener('animationend', function() {
    if (display.classList.contains('error')) {
        display.classList.remove('error');
    }
});

// Fare tekerleği ile sayıları artır/azalt (bonus özellik)
display.addEventListener('wheel', function(event) {
    event.preventDefault();
    
    if (!isNaN(currentInput) && currentInput !== 'Hata') {
        let num = parseFloat(currentInput) || 0;
        
        if (event.deltaY < 0) {
            num += 1; // Yukarı kaydırma - artır
        } else {
            num -= 1; // Aşağı kaydırma - azalt
        }
        
        currentInput = num.toString();
        updateDisplay();
    }
});

// Performans için debounce fonksiyonu
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Ekran boyutu değişikliklerini dinle (responsive)
window.addEventListener('resize', debounce(function() {
    // Mobil cihazlarda font boyutunu ayarla
    if (window.innerWidth < 480) {
        display.style.fontSize = '1.5rem';
    } else {
        display.style.fontSize = '2rem';
    }
}, 250));