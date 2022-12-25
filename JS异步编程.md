要更好的理解异步编程，首先应该更好地理解需求。

我是在写小程序写出回调地狱时，才理解了 `Promise` 中的那些 `then` 到底是在干嘛，好处在哪里。



#### 回调

实现异步的基本思路就是回调，在各种网络请求中非常常见：我们不能一直挂机等待网络返回数据，这样太慢，而有些任务又必须等请求数据返回后才能继续。那么就让网络请求异步地执行，主进程继续，等到数据返回后，再调用一个回调函数来处理这些数据。

`setTimeout`，`wx.request` 等都是异步的方法，需要传入回调函数。

然而传统回调的方式有个很大的问题，一旦依赖链长了（比如我需要先请求 `data1`，有了 `data1` 之后才能去请求 `data2`..这样下去，就必须写很多个回调函数嵌套，代码会变得丑陋不堪。

注意：上面用到了进程的说法，并不是指传统意义上的进程（但我找不到词了，大概就是同步程序流程的意思），另外JS始终是单线程的，它通过分片之类的办法实现异步，我们不需要考虑互斥锁之类的事情。



#### Promise

Promise其实无非是通过玄学手段魔改了一下语法，让嵌套的写法变成了链式的写法。

它主要是为了解决链式数据依赖的请况（名字自己瞎编的，就上面那种情况），因此我们主要关注数据流向。

```js
var pro = new Promise(function(resolve, reject) {
    console.log('start')
    resolve(1);
})

pro.then(data => {
    console.log(data)
    return data + 1;
}).then(data => {
    console.log(data)
    return data + 1;
}).then(data => {
    console.log(data)
})
```

创建Promise对象时传入一个函数作为参数，这个函数将立即异步执行，当然此时主进程中我们已经得到这个Promise对象了，它的状态为`Pending`

当异步过程调用了 `resolve` 时，状态将变为 `fulfilled(已执行)`，同时将数据（这里的1）**保存**了下来。

我们在主进程中可以调用Promise对象的then方法，往后“追加”一个流程函数，流程函数会使用上面resolve保留的数据作为参数，也就是说，它会等到Promise对象变为 `fulfilled` 状态再执行。

Promise的状态改变是永久的，只会由 `Pending` 变为 `fulfilled` 或 `rejected`，并且不会变回去。我们随时可以then，都可以利用保存的数据进行下一步操作。

then的返回值是一个新Promise，它初始也处于 `Pending` 态，流程函数中直接return相当于 `resolve`，可以throw来替代reject



##### 异常处理

当出现异常时，我们可以正常抛出，也可以执行 `reject`，它将使Promise对象进入 `rejected` 态

then方法中可以传入第二个函数，为进入 `reject` 态的处理。处理完毕后可以正常return，then的返回值仍然进入 `fullfiled` 态，接下来的then正常处理。

如果then中没有传相应的处理函数，则将原本的Promise原样返回。也就是说异常会链式传递下去，直到被处理为止。

Promise.catch 可用于捕获异常，和then仅用第二个参数差不多。

Promise.finally 即进入任何非 `pending` 态都一样处理，它没有参数，用于链式调用的末尾。

catch，finally的返回值仍然是Promise，它们在下面会有很好的用处。



#### async await

`async` 是一个语法糖，它让函数返回一个Promise，函数体本身即可直接异步执行，函数return会调用 `resolve`，函数内部抛出错误会使得Promise变为 `reject` 态。

`await` 只能用在 `async` 函数中，它以Promise作为参数，它会阻塞，等到Promise执行完毕，然后返回Promise的resolve值。

如果 `await` 后面跟正常值，就会原样返回。

任何一个 `await` 后面的Promise进入reject态了，整个async函数都会中断并抛出。

用到 `async await` 后，异步编程就和同步变成一样简单了，`await` 看作等待即可。

##### 异常处理

如果不希望直接弹出，还要进行一些操作

最优雅的方式：

```js
await dosomething().catch(e => {...})
```

dosomething这个Promise如果异常，就会直接被catch了，然后catch处理后返回正常的Promise，故await不会接到一个reject的Promise而中断。
