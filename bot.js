const express = require('express')
const bodyParser = require('body-parser')
const Markup = require('node-vk-bot-api/lib/markup');
const Scene = require('node-vk-bot-api/lib/scene')
const Session = require('node-vk-bot-api/lib/session')
const Stage = require('node-vk-bot-api/lib/stage')
const VkBot  = require('node-vk-bot-api')

//const app = express() // CallBack
const bot = new VkBot({
  //confirmation: '82d40e3b',
  token: '929f8806197cf08acc483bd8e241f9e6ee54ebd6d8606722596512e9587a7f7055ba159e2efb4189514e6',
})

//api version 5.120

//#################################################################################################//
//#################################################################################################//
//##################################      ШАБЛОННЫЕ ОТВЕТЫ      ###################################//
//#################################################################################################//
//#################################################################################################//

var Mess = [
  {
  posts: [],
  label: 'Приветствие',
  order: 0
  }
]

const defaultPhoto = 'photo206382598_457251185_7e87d0de96d96ccf8f'

//#################################################################################################//
//#################################################################################################//
//####################################      ОПИСАНИЕ СЦЕН      ####################################//
//#################################################################################################//
//#################################################################################################//

const menu = new Scene('menu',
//:::: КЛАССИЧЕСКОЕ МЕНЮ :::://
async (ctx) => {
    // Сцена 0
    // Приветствие + стартовое меню
    console.log(`\t-Пользователь https://vk.com/id${ctx.message.from_id} начал диалог с ботом`)
    
    ctx.scene.next()
    await showPost(ctx, 0)
    await printMenu(ctx)
  },
  async (ctx) => {
    // Сцена 1
    // Обработчик
    switch(ctx.message.text){
      
      case '/menu':
      case 'Показать меню':
      
        await printMenu(ctx)
        break
        
      case '/exit':
        
        console.log(`\t-Пользователь https://vk.com/id${ctx.message.from_id} закончил диалог с ботом`)
        
        await ctx.reply('Еще увидимся)',null,Markup.keyboard([Markup.button('Начать','primary')]).oneTime())
        ctx.scene.leave()
        break

      case '/admin':
        
        console.log(`\t-Пользователь https://vk.com/id${ctx.message.from_id} вошел с ролью Администратора`)
        
        ctx.scene.next()
        await ctx.reply(
            'Привет админушка!\n'+
            'Ну что, будем куралесить?'
          )
        await printAdminMenu(ctx)
        break

      default:

        if(ctx.message.text > 0 && ctx.message.text < Mess.length)
          await showPost(ctx, ctx.message.text)
        else
          await ctx.reply('Не понимаю о чем это ты😅')
      }
    },
    //:::: МЕНЮ АДМИНА :::://
    async (ctx) => {
      // Сцена 2
      // Обработчик
      ctx.session.isEdited = true
      switch(ctx.message.text){
        case '/menu':
          await printAdminMenu(ctx)
          break
        case '/exit':
          await ctx.reply('Прощай, админушка',null,Markup.keyboard([Markup.button('Начать','primary')]).oneTime())
          console.log(`\t-Пользователь https://vk.com/id${ctx.message.from_id} больше не Администратор`)
          await printMenu(ctx)
          ctx.scene.step=1
          break
        default:
          if(ctx.message.text > 0 && ctx.message.text < 5){
            switch(ctx.message.text){
              case '1':
                await ctx.reply('Введи название нового раздела')
                await ctx.reply(
                  'или напиши /cancel, чтобы ничего не делать',
                  null,
                  Markup.keyboard([Markup.button('/cancel','negative')]).oneTime()
                )
                ctx.scene.step=3
                break
              case '2':
                if(Mess.length > 1){
                  await printMenu(ctx)
                  await ctx.reply('Укажи номер раздела, который хочешь удалить')
                  await ctx.reply(
                    'или напиши /cancel, чтобы ничего не делать',
                    null,
                    Markup.keyboard([Markup.button('/cancel','negative')]).oneTime()
                  )
                  ctx.scene.step=4
                }
                else
                  ctx.reply('Операция недоступна')
                break
              case '3':
                if(Mess.length > 1){
                  await printMenu(ctx)
                  await ctx.reply(
                    'Укажи номер раздела, который хочешь изменить\n'+
                    'Отправь 0, если хочешь изменить Приветствие')
                  await ctx.reply(
                    'или напиши /cancel, чтобы ничего не делать',
                    null,
                    Markup.keyboard([Markup.button('/cancel','negative')]).oneTime()
                  )
                  ctx.scene.step=5
                }
                else
                  ctx.reply('Операция недоступна')
                break
              case '4':
                if(Mess.length > 2){
                  await printMenu(ctx)
                  await ctx.reply(
                    'Укажи порядок следования разделов\n'+
                    'например, как в следующем сообщении'
                    )
                  await ctx.reply('1 4 2 3')
                  await ctx.reply(
                    'или напиши /cancel, чтобы ничего не делать',
                    null,
                    Markup.keyboard([Markup.button('/cancel','negative')]).oneTime()
                  )
                  ctx.scene.step=7
                }
                else
                  ctx.reply('Операция недоступна')
                break
            }
          }
          else
            await ctx.reply('Не понимаю о чем это ты😅')
        }
    },
    async (ctx) => {
      // Сцена 3
      // Добавление раздела
      if(ctx.message.text != '/cancel'){
        await addPost(ctx.message.text)
        await ctx.reply(`Раздел '${ctx.message.text}' добавлен`)
      }
      await printAdminMenu(ctx)
      ctx.scene.step=2
    },
    async (ctx) => {
      // Сцена 4
      // Удаление раздела
      if(ctx.message.text != '/cancel'){
        if(ctx.message.text > 0 && ctx.message.text < Mess.length){
          await ctx.reply(`Раздел '${Mess[ctx.message.text].label}' удален`)
          await delPost(ctx.message.text)
        }
        else
          await ctx.reply('Невозможно выполнить указанное действие')
      }
      await printAdminMenu(ctx)
      ctx.scene.step=2
    },
    async (ctx) => {
      // Сцена 5
      // Изменение раздела
      if(ctx.message.text != '/cancel'){
        if(ctx.message.text >= 0 && ctx.message.text < Mess.length && ctx.message.text != ''){
          await ctx.reply('Сейчас этот раздел выглядит так:')
          await showPost(ctx, ctx.message.text)
          await ctx.reply(
            'Оформи в следующих сообщениях его так, как нужно и отправь мне '+
            'или напиши /done если не хочешь ничего не менять или закончил оформление\n\n'+
            'Допустимые виды вложений:\n📌изображения,\n📌видео,\n📌аудио,\n📌длинные посты(только текстовая ссылка📜),\n'+
            '📌записи со стен сообщества(только текстовая ссылка📜),\n📌прочие ссылки(только текстовая ссылка📜)',
            null,
            Markup.keyboard([Markup.button('/done','positive')])
          )
          ctx.session.postId=ctx.message.text
          ctx.scene.next()
        }
        else{
          await ctx.reply('Невозможно выполнить указанное действие')
          await printAdminMenu(ctx)
          ctx.scene.step=2
        }
      }
      else{
        await printAdminMenu(ctx)
        ctx.scene.step=2
      }
    },
    async (ctx) => {
      // Сцена 6
      // Изменение содержания сообщения
      if(ctx.message.text != '/done')
      {
        if(ctx.session.isEdited){
          ctx.session.isEdited = false
          Mess[ctx.session.postId].posts = []
        }
        await editPost(
          ctx.session.postId,
          ctx.message.text,
          ctx.message.attachments.map(e => {
            return `${e.type}${e[e.type].owner_id}_${e[e.type].id}_${e[e.type].access_key}`
          })
        )
        }
      else{
          await printAdminMenu(ctx)
          ctx.scene.step=2
        }
    }, 
    async (ctx) => {
      // Сцена 7
      // Изменение последовательности разделов
      if(ctx.message.text != '/cancel'){
        await mixPost(ctx.message.text)
        await ctx.reply(`Разделы упорядочены`)
      }
      await printAdminMenu(ctx)
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

async function addPost(text){
  await Mess.push(
    {
      posts:[],
      label:text,
      order:0
    })
}

async function delPost(postId){
  await Mess.splice(postId,1)
}

async function editPost(postId,text,attachments){
  await Mess[postId].posts.push(
    {
      text: text,
      attachments: attachments.map(value => {return value})
    })
    
}

async function mixPost(positions){
  positions.split(' ').map((order,index) =>{
    if(index < Mess.length && order < Mess.length)
      Mess[order].order = index+1
  })
  Mess.sort((a,b)=>{return a.order-b.order})
}

async function showPost(ctx, postId){
  if(postId >= Mess.length || postId < 0)
    ctx.reply(
      'Такого блока не существует',
      defaultPhoto
    )
  if(Mess[postId].posts.length == 0){
    await ctx.reply(
      'Этот блок еще не готов',
      defaultPhoto)
    }
  else
    for (e of Mess[postId].posts){
      await ctx.reply(
        e.text,
        e.attachments)
    }
}

async function printMenu(ctx){
  if(Mess.length > 1)
    await ctx.reply(
      Mess.map((e, index) =>{
        if(index)
          return `${index}. ${e.label}`
      }).join('\n')+'\n\n'+
      '💡Чтобы увидеть это сообщение еще раз отправь мне /menu',
      null,
      Markup.keyboard([Markup.button('Показать меню','primary')])
    )
  else
    await ctx.reply('Меню еще не готово :(', defaultPhoto)
}

async function printAdminMenu(ctx){
  await ctx.reply(
    'Список возможных действий:\n'+
    '1. Добавить раздел (✅Действие доступно)\n'+
    `2. Удалить раздел (${Mess.length > 1 ? '✅Действие доступно' :'🚫Действие недоступно'})\n`+
    `3. Изменить раздел (${Mess.length > 1 ? '✅Действие доступно' :'🚫Действие недоступно'})\n`+
    `4. Указать последовательность разделов (${Mess.length > 2 ? '✅Действие доступно' :'🚫Действие недоступно'})\n\n`+

    '💡Чтобы увидеть это сообщение еще раз отправь мне /menu',
    null,
    Markup.keyboard([
      [
        Markup.button('/menu','primary'),
        Markup.button('/exit','negative'),
      ],
  ])
  )
}

//#################################################################################################//
//#################################################################################################//
//##############################      ОБРАБОТЧИКИ КЛЮЧЕВЫХ ФРАЗ      ##############################//
//#################################################################################################//
//#################################################################################################//

bot.on(async (ctx) => {
  await ctx.scene.enter('menu')
})

//#################################################################################################//
//#################################################################################################//
//#####################################      ЗАПУСК БОТА      #####################################//
//#################################################################################################//
//#################################################################################################//


/*
//CallBack
app.use(bodyParser.json())

app.post('/', bot.webhookCallback)
 
app.listen(8080)
*/

//LongPoll
bot.startPolling()

console.log('\t-Бот запущен')