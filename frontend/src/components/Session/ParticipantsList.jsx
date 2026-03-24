import React from 'react'
import { FaUser, FaUsers } from 'react-icons/fa'
import { APP_CONFIG } from '../../utils/constants'

const ParticipantsList = ({ participants, hostName }) => {
  if (!participants || participants.length === 0) {
    return (
      <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-4'>
        <div className='flex items-center mb-4'>
          <FaUser className='w-5 h-5 mr-2 text-indigo-600' />
          <h2 className='text-xl font-bold text-gray-900'>
            {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.HEADING}
          </h2>
        </div>

        <div className='text-center py-4'>
          <p className='text-sm text-gray-500'>
            {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.EMPTY_MESSAGE}
          </p>
        </div>
      </div>
    )
  }

  const hostParticipants = participants.filter((p) => p.userName === hostName)
  const otherParticipants = participants.filter((p) => p.userName !== hostName)
  return (
    <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-4'>
      <div className='flex items-center mb-4'>
        <FaUsers className='w-5 h-5 mr-2 text-indigo-600' />
        <h2 className='text-xl font-bold text-gray-900'>
          {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.HEADING} ({participants.length})
        </h2>
      </div>
      <div className='space-y-3'>
        {hostParticipants.map((p) => (
          <div key={p._id} className='p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center'>
                <span className='text-white'>
                  {p.userName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className='font-semibold text-gray-900'>
                  {p.userName}
                </p>
                <p className='text-blue-600 text-sm'>
                  {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.HOST_LABEL}
                </p>
              </div>
            </div>
          </div>
        ))}

        {otherParticipants.length > 0 && (
          <>
            <div className='pt-1 border-t border-gray-200 text-sm text-gray-500'>
              {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.JOINED_USERS_LABEL}
              {otherParticipants.map((p) => (
                <div key={p._id} className='p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center'>
                      <span>
                        {p.userName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>
                        {p.userName}
                      </p>
                      <p className='text-sm text-blue-600'>
                        {APP_CONFIG.SESSION_CONTENT.PARTICIPANTS.PARTICIPANT_LABEL}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ParticipantsList