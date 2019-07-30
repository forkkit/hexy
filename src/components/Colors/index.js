import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import * as firebase from 'firebase/app'
import 'firebase/storage'
import 'firebase/auth'
import { ReactComponent as Sync } from '../../images/sync.svg'
import SwatchList from '../SwatchList'
import { getNumberOfNamedColors } from '../../utils/helpers'
import './Colors.scss'

const Colors = React.memo(
    ({
        colors,
        searchInput,
        searchSubmitted,
        noMatch,
        handleFavorites,
        removeFavorite,
        // getFavorites,
        favorites,
        favoriteSwatches,
        setFavoriteSwatches,
        handleBright,
        sortBright,
        setSortBright,
        history,
        getRandoms,
        handleAllColors,
        loadMoreColors,
        currentUser
    }) => {
        const [rotate, setRotate] = useState(false)
        const [isLoading, setIsLoading] = useState(false)
        const [pro, setPro] = useState(false)
        const { user } = useAuthState(firebase.auth())

        const handleReload = event => {
            getRandoms(event)
            setRotate(true)
            setSortBright(!sortBright)
            const timeout = setTimeout(() => {
                setRotate(false)
            }, 500)

            return () => {
                clearTimeout(timeout)
            }
        }

        const handleLoading = () => {
            setIsLoading(true)
        }

        useEffect(() => {
            if (colors && colors.length > 1000) {
                setIsLoading(false)
            }
            return () => {
                setIsLoading(false)
            }
        }, [colors])

        useEffect(() => {
            if (currentUser && currentUser) {
                if (currentUser.accountType !== 'standard') {
                    setPro(true)
                }
            }
            // return () => {

            // }
        }, [currentUser])

        const handleScroll = () => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            })
        }

        // useEffect(() => {
        //     getFavorites()
        // }, [favorites])

        // console.log('Colors', colors && colors.length)

        return (
            <div
                className={`colors ${
                    colors && colors.length > 1000
                        ? 'all-colors'
                        : 'random-colors'
                }`}
            >
                <div className="colors-header">
                    <div className="colors-header-text">
                        {!searchSubmitted ? (
                            <p>
                                Showing{' '}
                                {colors && colors.length === 1000
                                    ? '1000 random'
                                    : colors && colors.length}{' '}
                                colors.{' '}
                                <span
                                    className={`more-trigger ${
                                        rotate ? 'rotate' : ''
                                    }`}
                                    onClick={handleReload}
                                >
                                    <Sync />
                                </span>{' '}
                                Reload for a new set.{' '}
                                {currentUser && pro && (
                                    <span
                                        className="all-colors like-link"
                                        onClick={() => {
                                            handleAllColors()
                                            handleLoading()
                                        }}
                                    >
                                        See all {getNumberOfNamedColors()}{' '}
                                        colors (really slow).
                                    </span>
                                )}
                            </p>
                        ) : searchSubmitted ? (
                            <p className="search-results-text">
                                Search results for{' '}
                                <span className="search-term">
                                    {searchInput}
                                </span>
                                :{' '}
                                {noMatch && (
                                    <span className="no-match">
                                        There were no exact matches for your
                                        search. Here is the nearest named color:
                                    </span>
                                )}
                            </p>
                        ) : null}
                        {searchInput && noMatch ? (
                            <h3>
                                Sorry, there were no matches for your search.
                            </h3>
                        ) : null}
                    </div>

                    <div className="sort-input">
                        <input
                            type="checkbox"
                            onChange={handleBright}
                            checked={sortBright}
                        />
                        <label>Sort by brightness (perceptual)</label>
                    </div>
                </div>
                {!isLoading ? (
                    <SwatchList
                        noMatch={noMatch}
                        colors={colors}
                        handleFavorites={handleFavorites}
                        removeFavorite={removeFavorite}
                        favorites={favorites}
                        favoriteSwatches={favoriteSwatches}
                        setFavoriteSwatches={setFavoriteSwatches}
                        searchSubmitted={searchSubmitted}
                        sortBright={sortBright}
                    />
                ) : (
                    <div className="loading">
                        <h3>
                            Loading all {getNumberOfNamedColors()}{' '}
                            colors...please be patient.
                        </h3>
                    </div>
                )}
                {colors && colors.length > 1000 && (
                    <div className="load-more">
                        <button
                            className="button"
                            onClick={() => loadMoreColors(colors.length)}
                        >
                            Load More Colors
                        </button>

                        <div className="colors-links">
                            <button className="button" onClick={handleReload}>
                                Reload 1000 random colors
                            </button>
                        </div>
                    </div>
                )}
                <div className="scroll-to-top">
                    <button className="button" onClick={handleScroll}>
                        Scroll to top
                    </button>
                </div>
            </div>
        )
    }
)

// Colors.whyDidYouRender = true

export default withRouter(Colors)
