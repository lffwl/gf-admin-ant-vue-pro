export function ListToTree (data) {
  var treeData = []
  if (!Array.isArray(data)) return treeData

  data.forEach(item => {
    delete item.children
  })

  var map = {}
  data.forEach(item => {
    map[item.id] = item
  })

  data.forEach(item => {
    var parent = map[item.pid]
    if (parent) {
      (parent.children || (parent.children = [])).push(item)
    } else {
      treeData.push(item)
    }
  })
  return treeData
}

export function GetIds (data) {
  var map = []
  data.forEach(item => {
    map.push(item.id)
  })
  return map
}

export function MapKeyToValue (data) {
  var map = {}
  data.forEach(item => {
    map[item.id] = item.name
  })
  return map
}
