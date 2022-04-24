function fileSize(a,b,c,d,e){
    return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)
        +' '+(e?'kMGTPEZY'[--e]+'B':'Bytes')
}

const el = selector => document.querySelector(selector)

moment.locale('br')

// Wait until document has been fully parsed
document.onreadystatechange = e => {
    if (document.readyState !== 'interactive') return

    // show 404 page 
    if (!window.downloadInfo) {
        el('#app').classList.remove('shown')
        el('#err404').classList.add('shown')
        return
    }

    el('#app').classList.add('shown')

    // Populate elements with downloadInfo sent from server
    el('#fileName').innerText = downloadInfo.metadata.name
    el('#shareDate').innerText = moment(parseInt(downloadInfo.metadata.uploadDate) || Date.now()).fromNow()
    el('#fileDescription').innerText = downloadInfo.metadata.description || ''

    el('#dl').addEventListener('click', () => {
        // Redirect to download URL
        location.href = location.href + '/dl'
    })

    el('#direct').addEventListener('click', () => {
        navigator.clipboard.writeText(location.href + '/dl')
    })

    // Setup treeview
    const treeView = el('#tree-view')
    const createTreeViewNode = (depth, name, isDir) => {
        const div = document.createElement('div')
        div.classList.add('tree-node', isDir ? 'directory' : 'file')

        div.style.marginLeft = `${depth}em`

        const elName = document.createElement('span')
        elName.innerText = name
        elName.classList.add('name')

        const elIcon = document.createElement('img')
        elIcon.src = `/assets/${isDir ? 'folder' : 'file'}.png`
        elIcon.classList.add('icon')

        treeView.appendChild(div)
        div.appendChild(elIcon)
        div.appendChild(elName)

        return div
    }

    const walkDirectory = (root, cb, _prevPath = '/') => {
        for (const [ name, entry ] of Object.entries(root.items)) {
            if (entry.type === 'directory') {
                walkDirectory(entry, cb, _prevPath + '/' + name)
            } else {
                cb(entry, _prevPath + '/' + name)
            }
        }
    }

    let fileSizeSum = 0

    for (const rootEntry of downloadInfo.rootItems) {
        if (rootEntry.type === 'directory') {
            walkDirectory(rootEntry, (childEntry, childPath) => {
                const pathSegments = childPath.split('/').filter(seg => seg.length > 0)

                for (let i = 0; i < pathSegments.length - 1; i++) {
                    let segment = pathSegments[i]

                    if (document.getElementById('/' + pathSegments.slice(0, i+1).join('/')))
                        continue

                    let folderDiv = createTreeViewNode(i, segment, true)
                    folderDiv.id = '/' + pathSegments.slice(0, i+1).join('/')
                }

                // Add file
                createTreeViewNode(pathSegments.length - 1, pathSegments[pathSegments.length - 1], false)
                fileSizeSum += childEntry.size
            }, `/${rootEntry.name}`)
        } else {
            createTreeViewNode(0, rootEntry.name, false)
        }
    }

    // Update file size label text
    el('#fileSize').innerText = fileSize(fileSizeSum)
}