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
//##################################      ШАБЛОННЫЕ ОТВЕТЫ      ###################################//
//#################################################################################################//
//#################################################################################################//

var welcomeMess         = {text:undefined,attachments:undefined}         
var whatIsMess          = {text:undefined,attachments:undefined}
var whatNextMess        = {text:undefined,attachments:undefined}
var invitePlayerMess    = {text:undefined,attachments:undefined}
var inviteVolunteerMess = {text:undefined,attachments:undefined}
var FAQMess             = {text:undefined,attachments:undefined}

var Mess = [welcomeMess,whatIsMess,whatNextMess,invitePlayerMess,inviteVolunteerMess,FAQMess]

//#################################################################################################//
//#################################################################################################//
//####################################      ОПИСАНИЕ СЦЕН      ####################################//
//#################################################################################################//
//#################################################################################################//

const menu = new Scene('menu',
//:::: КЛАССИЧЕСКОЕ МЕНЮ :::://
(ctx) => {
    // Сцена 0
    // Приветствие + стартовое меню
    ctx.scene.next()
    if(Mess[0].text === undefined && Mess[0].attachments === undefined)
      ctx.reply( 
        'Тебя приветствует сообщество BSTU Game Championship🔥\n\n' +
        'На данный момент наша команда все еще занимается разработкой '+
        'этого чат-бота, но не расстраивайся, скоро он заработает😉\n' +
        'А пока держи печеньку 🍪',
        'photo-171865957_456239018')
    else
      ctx.reply(
        Mess[0].text,
        Mess[0].attachments)
    console.log(`\t-Пользователь https://vk.com/id${ctx.message.from_id} начал диалог с ботом`)
    printMenu(ctx.message.from_id)
  },
  (ctx) => {
    // Сцена 1
    // Обработчик
    switch(ctx.message.text){
      case '/menu':
      case 'Показать меню':
        printMenu(ctx.message.from_id)
        break
      case '/exit':
        bot.sendMessage(ctx.message.from_id,'Еще увидимся)',null,null)
        console.log(`\t-Пользователь https://vk.com/id${ctx.message.from_id} закончил диалог с ботом`)
        ctx.scene.leave()
        break
      case '/admin #BSTU_GC':
        ctx.scene.next()
      ctx.reply(
        'Привет админушка!\n'+
        'Ну что, будем куралесить?'
      )
      console.log(`\t-Пользователь https://vk.com/id${ctx.message.from_id} вошел с ролью Администратора`)
      printAdminMenu(ctx.message.from_id)
        break
      default:
        if(ctx.message.text > 0 && ctx.message.text <= 5)
          showPost(ctx.message.text,ctx.message.from_id)
        else
          bot.sendMessage(ctx.message.from_id,'Не понимаю о чем это ты😅')
      }
    },
    //:::: МЕНЮ АДМИНА :::://
    (ctx) => {
      // Сцена 2
      // Обработчик
      ctx.session.edit = undefined
      switch(ctx.message.text){
        case '/menu':
          printAdminMenu(ctx.message.from_id)
          break
        case '/exit':
          bot.sendMessage(ctx.message.from_id,'Прощай, админушка',null,null)
          console.log(`\t-Пользователь https://vk.com/id${ctx.message.from_id} больше не Администратор`)
          printMenu(ctx.message.from_id)
          ctx.scene.step=1
          break
        default:
          if(ctx.message.text >= 0 && ctx.message.text <= 5){
            bot.sendMessage(ctx.message.from_id,'Сейчас этот раздел выглядит так:')
            console.log(`\t-Админушка https://vk.com/id${ctx.message.from_id} куралесит`) // я всё еще не понимаю, почему без этой
            showPost(ctx.message.text,ctx.message.from_id)
            console.log(`\t-Админушка https://vk.com/id${ctx.message.from_id} куралесит`) // и этой строки методы ниже пропускаются
            bot.sendMessage(ctx.message.from_id,
              'Оформи в следующем сообщении его так, как нужно и отправь мне '+
              'или напиши /cancel если не хочешь ничего не менять'
              )
            ctx.session.edit=ctx.message.text
            ctx.scene.next()
          }
          else
            bot.sendMessage(ctx.message.from_id,'Не понимаю о чем это ты😅')
        }
    },
    (ctx) => {
      // Сцена 3
      // Изменение содержания сообщения
      if(ctx.message.text != '/cancel')
        editPost(
          ctx.session.edit,
          ctx.message.text,
          ctx.message.attachments.map(e => {
            switch(e.type){
              case 'photo':
                return `${e.type}${e.photo.owner_id}_${e.photo.id}_${e.photo.access_key}`
              case 'video':
                return `${e.type}${e.video.owner_id}_${e.video.id}_${e.video.access_key}`
            }
          })
        )
      printAdminMenu(ctx.message.from_id)
      ctx.scene.step=2
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

function editPost(postId,text,attachments){
  Mess[postId].text = text,
  Mess[postId].attachments = attachments
}

function showPost(postId,userId){
  if(Mess[postId].text === undefined && Mess[postId].attachments === undefined)
    bot.sendMessage(
      userId, 
      'Этот блок еще не готов',
      'photo206382598_457249264_e9aaa35afe8822e9bf')
  else
    bot.sendMessage(
      userId,
      Mess[postId].text,
      Mess[postId].attachments)
}

function printMenu(userId){
  bot.sendMessage(userId,
    '1. Что такое BSTU Game Championship🏆\n'+
    '2. График проведения мероприятия💬\n'+
    '3. Хочу в волонтеры👻\n'+
    '4. Хочу зарегистрироваться как участник🏅\n'+
    '5. Часто задаваемые вопросы🆘\n\n'+
    '💡Чтобы увидеть это сообщение еще раз напиши /menu',
    null,
    Markup.keyboard([[
      Markup.button('1','default'),
      Markup.button('2','default'),
      Markup.button('3','default'),
    ],
    [
      Markup.button('4','default'),
      Markup.button('5','default')
    ],
    [
      Markup.button('Показать меню','primary')
    ]
  ])
  )
}

function printAdminMenu(userId){
  bot.sendMessage(userId,
    '0. Отчаяние\n'+
    '1. Отрицание\n'+
    '2. Гнев\n'+
    '3. Торг\n'+
    '4. Принятие\n'+
    '5. Смирение\n\n'+
    '💡Чтобы увидеть это сообщение еще раз напиши /menu',
    null,
    Markup.keyboard([[
      Markup.button('0','default'),
      Markup.button('1','default'),
      Markup.button('2','default'),
    ],
    [
      Markup.button('3','default'),
      Markup.button('4','default'),
      Markup.button('5','default')
    ],
    [
      Markup.button('/menu','primary'),
      Markup.button('/exit','negative'),
    ]
  ])
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