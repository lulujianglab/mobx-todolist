import { toJS, spy, observe, observable, action, computed, trace } from 'mobx'
import React, { Component, Fragment } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { observer, PropTypes as ObservablePropTypes } from 'mobx-react'

// spy(e => {
//   console.log('e', e)
// })

class Todo {
  id = Math.random()
  @observable title = ''
  @observable finished = false

  @action.bound toggle() {
    this.finished = !this.finished
  }

  constructor(title) {
    this.title = title
  }
}

class Store {
  // 可变数据用@observable修饰
  @observable todos = []

  disposers = []

  constructor() {
    // todos 发生变化触发 但只能监测表层数据
    observe(this.todos, change => {
      this.disposers.forEach(disposer => disposer())
      this.disposers = []

      for (let todo of change.object) {
        var disposer = observe(todo, changex => {
          this.save()
          // console.log('changex', changex)
        })

        this.disposers.push(disposer)
      }
      this.save()
      // console.log('change', change)
    })
  }

  save() {
    // 序列化todo数组，不包含额外的数据值
    localStorage.setItem('todos', JSON.stringify(toJS(this.todos)))
    console.log(toJS(this.todos))
  }

  @action.bound createTodo(title) {
    this.todos.unshift(new Todo(title))
  }

  @action.bound removeTodo(todo) {
    // remove 非原生方法，是mobx在observable Array 上添加的方法，用起来比较方便，否则需要id 遍历寻找删除
    this.todos.remove(todo)
  }

  // get属性 或者是依赖可归纳数据的属性 建议使用computed修饰
  @computed get left() {
    return this.todos.filter(todo => !todo.finished).length
  }
}

var store = new Store()

@observer
class TodoItem extends Component {
  static propTypes = {
    todo: PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      finished: PropTypes.bool.isRequired
    }).isRequired
  }
  
  handleClick = () => {
    console.log('111')
    this.props.todo.toggle()
    
    // 不建议直接修改store中的值 保持单向数据流
    // const { todo } = this.props
    // todo.finished = !todo.finished
  }

  render() {trace()
    const todo = this.props.todo
    return (
      <Fragment>
        <input type="checkbox" className="toggle" checked={todo.finished} onClick={this.handleClick} />
        <span className={['title', todo.finished && 'finished'].join(' ')}>{todo.title}</span>
      </Fragment>
    )
  }
}

@observer
class TodoFooter extends Component {
  static propTypes = {}

  render()  {trace()
    const store = this.props.store

    return (
      <footer>{store.left} item(s) unfinished</footer>
    )
  }
}

@observer
class TodoView extends Component {
  static propTypes = {}

  render() {
    const todos = this.props.todos
    return todos.map(todo => {
      return (
        <li key={todo.id} className="todo-item">
          <TodoItem todo={todo} />
          <span className="delete" onClick={() => store.removeTodo(todo)}>X</span>
        </li>
      )
    })
  }
}

@observer
class TodoHeader extends Component {
  static propTypes = {}

  state = {
    inputValue: '',
  }

  handleSubmit = e => {
    e.preventDefault()

    var store = this.props.store
    var inputValue = this.state.inputValue

    store.createTodo(inputValue)
    this.setState({
      inputValue: '',
    })
  }

  handleChange = e => {
    var inputValue = e.target.value

    this.setState({
      inputValue
    })
  }

  render() {
    return (
      <header>
        <form onSubmit={this.handleSubmit}>
          <input type="text" onChange={this.handleChange} value={this.state.inputValue} className="input" placeholder="What needs to be finished?" />
        </form>
      </header>
    )
  }
}

@observer
class TodoList extends Component {
  static propTypes = {
    store: PropTypes.shape({
      createTodo: PropTypes.func,
      todos: ObservablePropTypes.observableArrayOf(ObservablePropTypes.observableObject).isRequired
    }).isRequired
  }

  render() {trace()
    const store = this.props.store
    const todos = store.todos

    return <div className="todo-list">
      <TodoHeader store={store}/>
      <ul><TodoView todos={todos} /></ul>
      <TodoFooter store={store} />
    </div>
  }
}

ReactDOM.render(<TodoList store={store}/>, document.getElementById('root'))
