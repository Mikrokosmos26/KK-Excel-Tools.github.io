// script.js
// 配置存储对象
const elementConfig = {
  title: {
    size: 400,
    left: 50,
    top: 30
  },
  clouds: {
    large: { width: 260, right: 15, top: 100 },
    medium: { width: 170, right: 0, top: -15 },
    small: { width: 130, right: 230, top: 50 }
  },
  star: {
    size: 60,
    right: -20,
    top: -30
  },
  boards: {
    width: 280,
    height: 380,
    spacing: 50
  }
};

// 初始化样式控制器
class StyleController {
  constructor() {
    this.initControls();
    this.loadSettings();
    this.enableDrag();
  }

  // 创建调试控制面板
  initControls() {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(255,255,255,0.9);
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10000;
    `;
    
    // 生成控制项
    panel.innerHTML = `
      <h3 style="margin-bottom:10px;">元素调整面板</h3>
      ${this.createControl('标题宽度', 'title-size', 'title.size', 300, 500)}
      ${this.createControl('大云右侧位置', 'cloud-large-right', 'clouds.large.right', 0, 30)}
      ${this.createControl('星星大小', 'star-size', 'star.size', 30, 100)}
      <button onclick="styleController.saveSettings()" style="margin-top:10px;">保存设置</button>
      <button onclick="location.reload()">重置</button>
    `;

    document.body.appendChild(panel);
  }

  // 创建单个控制项
  createControl(label, id, path, min, max) {
    return `
      <div style="margin:8px 0;">
        <label style="display:block;">${label}：
          <input type="range" id="${id}" 
                 min="${min}" max="${max}" 
                 style="vertical-align:middle;"
                 oninput="styleController.update('${path}', this.value)">
        </label>
      </div>
    `;
  }

  // 更新参数值
  update(configPath, value) {
    const path = configPath.split('.');
    let obj = elementConfig;
    while(path.length > 1) {
      obj = obj[path.shift()];
    }
    obj[path[0]] = Number(value);
    this.applyStyles();
  }

  // 应用当前配置
  applyStyles() {
    // 标题设置
    document.documentElement.style.setProperty('--title-width', `${elementConfig.title.size}px`);
    document.documentElement.style.setProperty('--title-left', `${elementConfig.title.left}px`);
    document.documentElement.style.setProperty('--title-top', `${elementConfig.title.top}px`);

    // 云朵设置
    const clouds = elementConfig.clouds;
    document.documentElement.style.setProperty('--cloud-large-w', `${clouds.large.width}px`);
    document.documentElement.style.setProperty('--cloud-large-right', `${clouds.large.right}%`);
    document.documentElement.style.setProperty('--cloud-large-top', `${clouds.large.top}px`);

    // 星星设置
    document.documentElement.style.setProperty('--star-size', `${elementConfig.star.size}px`);
    document.documentElement.style.setProperty('--star-right', `${elementConfig.star.right}px`);
    document.documentElement.style.setProperty('--star-top', `${elementConfig.star.top}px`);
  }

  // 保存到本地存储
  saveSettings() {
    localStorage.setItem('pageStyleConfig', JSON.stringify(elementConfig));
  }

  // 加载存储的设置
  loadSettings() {
    const saved = localStorage.getItem('pageStyleConfig');
    if (saved) {
      Object.assign(elementConfig, JSON.parse(saved));
      this.applyStyles();
    }
  }

  // 启用拖拽调整
  enableDrag() {
    let draggedElement = null;

    document.addEventListener('mousedown', e => {
      if (e.target.closest('.cloud, .star')) {
        draggedElement = e.target;
        draggedElement.style.cursor = 'grabbing';
        draggedElement.style.transition = 'none';
      }
    });

    document.addEventListener('mousemove', e => {
      if (draggedElement) {
        const rect = draggedElement.getBoundingClientRect();
        const offsetX = e.clientX - rect.width/2;
        const offsetY = e.clientY - rect.height/2;
        
        // 更新位置参数
        const type = draggedElement.classList.contains('cloud-large') ? 'large' :
                     draggedElement.classList.contains('cloud-medium') ? 'medium' :
                     draggedElement.classList.contains('cloud-small') ? 'small' : 'star';
        
        if (type === 'star') {
          elementConfig.star.right = (offsetX / window.innerWidth * 100) - 5;
          elementConfig.star.top = (offsetY / window.innerHeight * 100) - 2;
        } else {
          elementConfig.clouds[type].right = (offsetX / window.innerWidth * 100);
          elementConfig.clouds[type].top = (offsetY / window.innerHeight * 100);
        }
        
        this.applyStyles();
      }
    });

    document.addEventListener('mouseup', () => {
      if (draggedElement) {
        draggedElement.style.cursor = '';
        draggedElement.style.transition = '';
        draggedElement = null;
        this.saveSettings();
      }
    });
  }
}

// 初始化控制器
const styleController = new StyleController();

// 页面加载完成后隐藏加载动画
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.querySelector('.loader-container');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }, 800);
});

// 返回顶部按钮功能
function initBackToTop() {
    const backToTopBtn = document.createElement('a');
    backToTopBtn.href = '#';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 添加图片加载失败处理
function initImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'source/photos/default.png'; // 替换为你的默认图片
            this.alt = '图片加载失败';
        });
    });
}

// 初始化新功能
initBackToTop();
initImageErrorHandling();

// 添加页面加载动画元素
const loaderHTML = `
    <div class="loader-container">
        <div class="loader"></div>
    </div>
`;
document.body.insertAdjacentHTML('afterbegin', loaderHTML);