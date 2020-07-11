const express = require('express')
const bodyParser = require('body-parser')
const Markup = require('node-vk-bot-api/lib/markup');
const Scene = require('node-vk-bot-api/lib/scene')
const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')
const VkBot  = require('node-vk-bot-api')
 
const app = express()
const bot = new VkBot({
  confirmation: '',
  token: ''
})

//api callback 5.120

//#################################################################################################//
//#################################################################################################//
//####################################      ОПИСАНИЕ СЦЕН      ####################################//
//#################################################################################################//
//#################################################################################################//


const menu = new Scene('menu',
  (ctx) => {
    // Сцена 0
    // Приветствие + стартовое меню
    ctx.scene.next()
    ctx.reply(
      'Тебя приветствует сообщество BSTU Game Championship🔥\n\n' +
      'На данный момент наша команда все еще занимается разработкой этого чат-бота, но не расстраивайся, скоро он заработает😉\n' +
      'А пока держи печеньку 🍪',
      'photo-171865957_456239018'
    )
    console.log(`\t-Пользователь https://vk.com/id${ctx.message.from_id} начал диалог с ботом`)
    printMenu(ctx.message.from_id)
    ctx.session.is_exit = 0
  },
  (ctx) => {
    // Сцена 1
    // Обработчик
    switch(ctx.message.text){
      case '1':
        whatIs(ctx.message.from_id)
        break
      case '2':
        whatNext(ctx.message.from_id)
        break
      case '3':
        inviteVolunteer(ctx.message.from_id)
        break
      case '4':
        invitePlayer(ctx.message.from_id)
        break
      case '5':
        FAQ(ctx.message.from_id)
        break
      case '/menu':
      case 'Показать меню':
        printMenu(ctx.message.from_id)
        break
      case '/exit':
        bot.sendMessage(ctx.message.from_id,'Еще увидимся)')
        ctx.session.is_exit=1
        console.log(`\t-Пользователь https://vk.com/id${ctx.message.from_id} закончил диалог с ботом`)
        ctx.scene.leave()
        break
      default:
        bot.sendMessage(ctx.message.from_id,'Не понимаю о чем это ты😅')
      }
    },
)
const session = new Session()
const stage = new Stage(menu)
 
bot.use(session.middleware())
bot.use(stage.middleware())

//#################################################################################################//
//#################################################################################################//
//##################################      ШАБЛОНЫ ПОВЕДЕНИЙ      ##################################//
//#################################################################################################//
//#################################################################################################//

function whatIs(user_id){
  bot.sendMessage(user_id,
    'Здесь будут информация о том, что такое BSTU GAME Championship'
  )
}

function whatNext(user_id){
  bot.sendMessage(user_id,
    'Здесь будут указываться ключевые события каждого из дней\n'+
    'а также детализация событий сегодняшнего дня(возможно это будут скрины турнирных сеток)'
  )
}

function inviteVolunteer(user_id){
  bot.sendMessage(user_id,
    'Здесь будут инструкции для желающих стать волонтерами'
  )
}

function invitePlayer(user_id){
  bot.sendMessage(user_id,
    'Здесь будут инструкции по регистрации игрока(команды)'+
    '\nс последующим занесением в базу данных'
  )
}

function FAQ(user_id){
  bot.sendMessage(user_id,
    'Здесь будут ответы на часто задаваемые вопросы и ссылка на топик(или беседу)'+
    'в которой администрация будет отвечать на вопросы'
  )
}

function printMenu(user_id){
  bot.sendMessage(user_id,
    '1⃣\nЧто такое BSTU Game Championship🏆\n\n'+
    '2⃣\nГрафик проведения мероприятия💬\n\n'+
    '3⃣\nХочу в волонтеры👻\n\n'+
    '4⃣\nХочу зарегистрироваться как участник🏅\n\n'+
    '5⃣\nЧасто задаваемые вопросы🆘\n\n'+
    '* Чтобы это сообщение еще раз напиши /menu',
    null,
    Markup.keyboard([
      Markup.button('1','primary'),
      Markup.button('2','primary'),
      Markup.button('3','positive'),
      Markup.button('4','positive'),
      Markup.button('5','primary'),
      Markup.button('6','negative')
    ]).oneTime()
  )
}

//#################################################################################################//
//#################################################################################################//
//##############################      ОБРАБОТЧИКИ КЛЮЧЕВЫХ ФРАЗ      ##############################//
//#################################################################################################//
//#################################################################################################//
 
bot.on((ctx) => {
  ctx.scene.enter('menu')
})

//#################################################################################################//
//#################################################################################################//
//#####################################      ЗАПУСК БОТА      #####################################//
//#################################################################################################//
//#################################################################################################//

app.use(bodyParser.json())
 
app.post('/', bot.webhookCallback)
 
app.listen(8080)

console.log('\t-Бот запущен')