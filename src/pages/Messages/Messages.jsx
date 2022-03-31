import styles from './Messages.module.css'
import loading from '../loading.module.css'
import ChatHistoryContainer from "./ChatHistoryContainer"
import MessageContainer from "./MessageContainer"
import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom"
import { getChatHistories, createChatHistory, addMessage } from "../../services/messageService"
import { getSelectProfiles } from "../../services/profileService"

const Messages = ({ profile }) => {
  const [allChatHistories, setAllChatHistories] = useState([])
  const [activeChatHistory, setActiveChatHistory] = useState()
  const [upToDateProfiles, setUpToDateProfiles] = useState()

  let params = useParams()
  
  const initActiveChatHistory = async (othersProfileID, allChatHistories) => {
    if (othersProfileID == profile._id) return 

    if (!othersProfileID) {
      setAllChatHistories(allChatHistories)
      setActiveChatHistory(allChatHistories[0])
      return activeChatHistory
    }
    let activeChatHistory = allChatHistories.filter(chatHistory => {
      try {
        if (chatHistory?.chatHistoryMembers?.includes(othersProfileID)) {
          return true
        } else {
          return false
        }
      } catch (error) {
        return false
      }
    })[0]

    if (activeChatHistory) {
      
      setAllChatHistories(allChatHistories)
      setActiveChatHistory(activeChatHistory)
      return activeChatHistory
    } else {
      let createdChatHistory = await createChatHistory({othersProfileID})
      setAllChatHistories([...allChatHistories, createdChatHistory])
      setActiveChatHistory(activeChatHistory)
      return activeChatHistory
    }

  }

  const getUpToDateProfiles = async (chatHistories) => {
    //console.log('hi')
    let profileSet = new Set()
    for (let chatHistory of chatHistories) {
      for (let profileID of chatHistory.chatHistoryMembers) {
        if (profileID) profileSet.add(profileID)
      }
    }
    let profileList = [...profileSet]
    let populatedProfiles = await getSelectProfiles(profileList) 

    return populatedProfiles
  }

  const upDateChatHistories = (upDatedActiveChatHistory) => {
    let tempAllChatHistories = allChatHistories.map(chatHistory => {
      if (chatHistory._id == upDatedActiveChatHistory._id) {
        return upDatedActiveChatHistory
      } else {
        return chatHistory
      }
    })

    setAllChatHistories(tempAllChatHistories)
  }

  const handleAddMessage = (messageDataObject) => {
    addMessage(messageDataObject)
    .then(upDatedActiveChatHistory => {
      console.log('Updated Active Chat History', upDatedActiveChatHistory)
      if (upDatedActiveChatHistory) {
        setActiveChatHistory(upDatedActiveChatHistory)
        upDateChatHistories(upDatedActiveChatHistory)
      }
    })
  }

  useEffect(()=>{
   getChatHistories()
   .then(tempAllChatHistories => initActiveChatHistory(params.id, tempAllChatHistories))   
 },[])

 useEffect(()=>{
   getUpToDateProfiles(allChatHistories)
   .then(populatedProfiles => setUpToDateProfiles(populatedProfiles))
 },[allChatHistories])


  return (
    <> 
    {allChatHistories && activeChatHistory ? 
    <div className={styles.container}>
    <div className={styles.messages}>
      
      <div className={styles.chatHistoryContainer}>
        <ChatHistoryContainer 
        activeChatHistory={activeChatHistory} 
        profile={profile} 
        allChatHistories={allChatHistories} 
        upToDateProfiles={upToDateProfiles} 
        setActiveChatHistory={setActiveChatHistory}
        key={profile._v}
      />
      </div>
      <div className={styles.messagesContainer}>
        <MessageContainer 
        activeChatHistory={activeChatHistory} 
        profile={profile} 
        handleAddMessage={handleAddMessage}
        key={profile._v}
      />
      </div>
    </div>
    </div>
    :
        <div className={loading.loading}>
          <i class="fas fa-spinner fa-pulse fa-2x"></i>
        </div>
    }
    </>
  )
}

export default Messages