import React from 'react'
import { Link } from 'react-router-dom'
import { ReactComponent as PlusCircle } from '../../images/plus_circle.svg'
import { ReactComponent as Heart } from '../../images/heart.svg'
import { ReactComponent as SearchIcon } from '../../images/search-solid.svg'
import { ReactComponent as Rocket } from '../../images/rocket.svg'

const Tiles = () => {
    return (
        <ul className="nostyle home-tiles">
            <li>
                <h2>
                    <span className="svg-icon">
                        <Rocket />
                    </span>{' '}
                    Quick Start
                </h2>
                <div className="tile-content">
                    <p>
                        Visit the <Link to="/colors">Colors</Link> page and
                        start scrolling. When you find a color you like, click
                        the{' '}
                        <span className="svg-icon">
                            <PlusCircle />
                        </span>{' '}
                        to add as a favorite. Your favorites will appear in the
                        Favorites sidebar. Toggle the sidebar using the switch
                        in the header.
                    </p>
                    <p>
                        Click on any swatches name or hex code to view a detail
                        page with color properties, harmonies, shades/tints, and
                        more.
                    </p>
                    <p>
                        The hope is that you discover new colors <em>while</em>{' '}
                        you are exploring the site and these will inspire you to
                        create something beautiful. That's really the whole
                        point of Hexy.
                    </p>
                </div>
            </li>
            <li>
                <h2>
                    <span className="svg-icon">
                        <SearchIcon />
                    </span>{' '}
                    Search Tips
                </h2>
                <div className="tile-content">
                    <p>
                        If you're looking for something specific, a great way to
                        find colors on Hexy is to search. If you're looking for
                        a nice shade of green, by all means type in "green" â€”
                        you will get a lot of greens to choose from.
                    </p>

                    <p>
                        Yet, not all greens will have "green" in the name so you
                        can also get creative and search for things like
                        "willow" or "tree" or "forest" or "wasabi".
                    </p>

                    <p>
                        You can also try descriptors like "vivid" or "muted" and
                        adjectives like "vintage" or "tropical".
                    </p>
                    <p>
                        You can also search for specific hex values and if there
                        is no named color, Hexy will return the closest named
                        color.
                    </p>

                    <p>
                        Note that while the <Link to="/colors">Colors</Link>{' '}
                        page only shows 1000 colors at a time, search looks
                        through the entire list of 18,000+ colors!
                    </p>
                </div>
            </li>
            <li>
                <h2>
                    <span className="svg-icon">
                        <Heart />
                    </span>{' '}
                    Favorites
                </h2>
                <div className="tile-content">
                    <p>
                        You can save any color (even a non-named color) as a
                        Favorite and up to 15 Favorites at any one time.
                    </p>

                    <p>
                        While five colors is often a good number for a website
                        palette, being able to view and group more colors really
                        helps to find the perfect hue for your project. And
                        sometimes five just isn't enough.
                    </p>

                    <p>
                        You can export your Favorites to an editable PDF file at
                        any time from the Favorites sidebar. Hexy's Favorites
                        are an awesome way to find and download palettes or
                        color groups quickly and use them in your designs or
                        code right away.
                    </p>
                    <p>
                        <Link to="/colors">
                            Explore more colors & view favorites &rarr;
                        </Link>
                    </p>
                </div>
            </li>
        </ul>
    )
}

export default Tiles
